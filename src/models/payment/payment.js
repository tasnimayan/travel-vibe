const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'upi', 'wallet'],
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      unique: true
    },
    paymentGateway: {
      provider: String,
      referenceId: String,
      metadata: Object
    },
    refund: {
      amount: Number,
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed']
      },
      transactionId: String,
      processedAt: Date
    },
    paymentBreakdown: {
      subtotal: Number,
      taxes: Number,
      fees: Number,
      discount: Number
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    cardDetails: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number
    },
    receiptUrl: String,
    notes: String
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });

// Update booking payment status after payment
paymentSchema.post('save', async function() {
  const booking = await this.model('Booking').findById(this.booking);
  
  // Calculate total paid amount for this booking
  const totalPaid = await this.model('Payment')
    .aggregate([
      { $match: { booking: this.booking, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

  const paidAmount = totalPaid[0]?.total || 0;

  // Update booking payment status
  if (paidAmount >= booking.price) {
    booking.paymentStatus = 'completed';
  } else if (paidAmount > 0) {
    booking.paymentStatus = 'partial';
  }

  await booking.save();
});

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
  this.refund = {
    amount,
    reason,
    status: 'pending',
    processedAt: new Date()
  };  
  // Add your refund processing logic here
  // Integration with payment gateway

  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;