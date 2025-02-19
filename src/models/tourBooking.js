// updated: 
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
	{
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'A Booking must be made on a Tour'],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'A Booking must belong to a User'],
		},
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required']
    }, 
		basePrice: {
      type: Number,
      required: [true, 'Base price is required']
    },
		price: {
			type: Number,
			required: [true, 'A Booking must have a price'],
		},
		discounts: {
      tourDiscount: {
        percentage: Number,
        amount: Number,
        type: { type: String, enum: ['percentage', 'fixed'] }
      },
      couponDiscount: {
        code: String,
        percentage: Number,
        amount: Number,
        type: { type: String, enum: ['percentage', 'fixed'] }
      }
    },
    totalDiscount: {
      type: Number,
      default: 0
    },

		depositAmount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
    },
    remainingAmount: {
      type: Number,
      required: [true, 'Remaining amount is required'],
    },
    paymentStatus: {
			type: String,
      enum: ['pending', 'partial', 'completed', 'refunded'],
      default: 'pending'
    },
		status: {
			type: String,
			enum: ['pending', 'confirmed', 'cancelled', 'completed'],
			default: 'pending'
		},
    numberOfTravelers: {
      type: Number,
      required: [true, 'Number of travelers is required'],
      min: 1
    },
    traveler: [{
      name: { type: String, required: true },
      age: { type: Number },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      idProof: { type: String },
      idNumber: { type: String }
    }],
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String }
    },
    specialRequests: { type: String },
    pickupLocation: { type: String },
    cancellationReason: { type: String },
    cancellationDate: { type: Date },
    refundAmount: { type: Number },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

bookingSchema.index({ tour: 1, user: 1 });
bookingSchema.index({ status: 1 });


bookingSchema.pre(/^find/, function (next) {
	this.populate('user').populate({ path: 'tour', select: 'name' });
	next();
});

// Calculate final price and remaining amount before saving
bookingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.basePrice = this.price;
  }

  let finalPrice = this.basePrice;
  let totalDiscount = 0;

  // Calculate tour discount if exists
  if (this.discounts.tourDiscount) {
    const tourDiscount = this.discounts.tourDiscount;
    if (tourDiscount.type === 'percentage') {
      tourDiscount.amount = (finalPrice * tourDiscount.percentage) / 100;
    }
    totalDiscount += tourDiscount.amount;
  }

  // Calculate coupon discount if exists
  if (this.discounts.couponDiscount) {
    const couponDiscount = this.discounts.couponDiscount;
    if (couponDiscount.type === 'percentage') {
      couponDiscount.amount = (finalPrice * couponDiscount.percentage) / 100;
    }
    totalDiscount += couponDiscount.amount;
  }

  // Update final price and total discount
  this.price = Math.max(0, finalPrice - totalDiscount);
  this.totalDiscount = totalDiscount;

  // Calculate remaining amount
  this.remainingAmount = this.price - this.depositAmount;

  next();
});

// Add method to apply coupon
bookingSchema.methods.applyCoupon = function(coupon) {
  this.discounts.couponDiscount = {
    code: coupon.code,
    percentage: coupon.percentage,
    amount: coupon.amount,
    type: coupon.type
  };
  return this.save();
};

const TourBooking = mongoose.model('Booking', bookingSchema, 'tour-booking');

module.exports = TourBooking;
