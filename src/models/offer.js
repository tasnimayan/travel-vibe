// updated:
import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema(
  {
		imagePath: { type: String , required:true },

		coupon: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      uppercase: true, 
      minlength: 5, 
      maxlength: 20 
    },
    discountRate: { 
      type: Number, 
      min: 0, 
      max: 100, 
      validate: {
        validator: function (value) {
          // Ensure either discountRate or discountAmount is provided, but not both
          return !(this.discountRate && this.discountAmount);
        },
        message: 'Cannot provide both discountRate and discountAmount!'
      }
    },
    discountAmount: { 
      type: Number, 
      min: 0, 
      validate: {
        validator: function (value) {
          // Ensure either discountRate or discountAmount is provided, but not both
          return !(this.discountRate && this.discountAmount);
        },
        message: 'Cannot provide both discountRate and discountAmount!'
      }
    },
    startDate: { 
      type: Date, 
      required: true, 
      default: Date.now 
    },
    endDate: { 
      type: Date, 
      required: true, 
      validate: {
        validator: function (value) {
          // Ensure endDate is after startDate
          return value > this.startDate;
        },
        message: 'End date must be after the start date!'
      }
    },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'upcoming'], 
      default: 'active' 
    },
    maxUsage: { 
      type: Number, 
      min: 1, 
      default: 100 
    },
    usedCount: { 
      type: Number, 
      min: 0, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    applicableTo: { 
      type: [String], 
      enum: ['tours', 'hotels', 'guides'], 
      default: ['tours'] 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin', 
      required: true 
    },
	},
	{timestamps:false}
)

offerSchema.index({ coupon: 1 }); // Index for coupon code

//Fetch all active offers
offerSchema.statics.getActiveOffers = async function () {
  try {
    const currentDate = new Date();
    const offers = await this.find({
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      isActive: true,
    });

    if (!offers || offers.length === 0) {
      throw new Error('No active offers found');
    }

    return offers;
  } catch (error) {
    console.error('Error fetching active offers:', error);
    throw error;
  }
};

// Validate a coupon code
offerSchema.statics.validateCoupon = async function (couponCode) {
  try {
    const offer = await this.findOne({
      coupon: couponCode,
      status: 'active',
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      usedCount: { $lt: '$maxUsage' },
    });

    if (!offer) {
      throw new Error('Invalid or expired coupon code');
    }

    return offer;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

// Increment the usedCount of an offer
offerSchema.statics.incrementUsage = async function (offerId) {
  try {
    const updatedOffer = await this.findByIdAndUpdate(
      offerId,
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!updatedOffer) {
      throw new Error('Offer not found');
    }

    // Automatically deactivate the offer if maxUsage is reached
    if (updatedOffer.usedCount >= updatedOffer.maxUsage) {
      updatedOffer.isActive = false;
      updatedOffer.status = 'expired';
      await updatedOffer.save();
    }

    return updatedOffer;
  } catch (error) {
    console.error('Error incrementing offer usage:', error);
    throw error;
  }
};



const Offer = mongoose.model('Offer', offerSchema)
module.exports = Offer;