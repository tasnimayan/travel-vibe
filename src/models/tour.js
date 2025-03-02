// updated:
const mongoose = require('mongoose')
const Organization = require('./organization')


const tourSchema = mongoose.Schema(
  {
    // _id - will be auto generated
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    bookingDeposit: { type: Number, min: 0 }, 
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: ['USD', 'EUR', 'INR', 'GBP'], default: 'USD' },
    startDate: { type: Date },
    endDate: { type: Date },
    duration: { type: String }, 
    images: [String],
    startingLocation: { type: String },
    highlightedPlaces: [{ type: String }],
    maxGroupSize: { type: Number, min: 1},
    pickupPoint: [ String ],
    departureTime: { type: Date },
    rating: { type:Number, min:1, max:5, set: val => ((val * 10) / 10).toFixed(2) },
    ratingQuantity: { type: Number },
    packages: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    },
    amenities: [{ type: String }], 
    itinerary:[{
      title: { type: String, required: true },
      activities: [{
        title: { type: String, required: true },
        description: { type: String, required: true }
      }]
    }],
    country: { type:String },
    tags: [{ type: String }],
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'ongoing' },
    isActive: { type: Boolean, default:true },
    
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy'
    },
    category:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourCategory',
      required:true,
		},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
  },
  {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

tourSchema.index({ startDate: 1, country: 1, category: 1 });

// Calculate finalPrice before providing the data to user
tourSchema.virtual('finalPrice').get(function () {
  if(discountAmount > 0 ) return this.price - this.discountAmount;
  if(discountPercentage > 0 ) return Math.round((this.price * (1 - (discountPercentage / 10000))) * 100) / 100;
  return this.price
});

tourSchema.methods.isDiscounted = ()=> {
  return this.discountPercentage > 0;
};

tourSchema.virtual('reviews', {
	ref: 'Review',
	localField: '_id',
	foreignField: 'tour',
});

tourSchema.virtual('bookings', {
	ref: 'Booking',
	localField: '_id',
	foreignField: 'tour',
});


tourSchema.methods.toJSON = function () {
	const tour = this.toObject();
	delete tour.__v;

	return tour;
};

//  Saves the tour data to the user's userTours field
tourSchema.pre('save', async function (next) {
	const org = await Organization.findOne({_id:this.orgId});
	if ( this.isNew) {
		org.tours.push(this._id);
    await org.save()
  }
	next();
});

// Populate relational data to the output
tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'orgId',
		select: 'name photo address',
	});
	next();
});


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;