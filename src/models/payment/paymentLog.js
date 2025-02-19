const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Payment',
      required: true
    },
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: true
    },
    action: {
      type: String,
      enum: ['payment_initiated', 'payment_success', 'payment_failed', 
             'refund_initiated', 'refund_success', 'refund_failed', 
             'status_changed', 'error'],
      required: true
    },
    status: String,
    amount: Number,
    description: String,
    metadata: Object,
    errorDetails: Object,
    ipAddress: String,
    userAgent: String
  },
  {
    timestamps: true
  }
);

paymentLogSchema.index({ payment: 1, createdAt: -1 });
paymentLogSchema.index({ booking: 1, createdAt: -1 });

const PaymentLog = mongoose.model('PaymentLog', paymentLogSchema);

module.exports = PaymentLog;