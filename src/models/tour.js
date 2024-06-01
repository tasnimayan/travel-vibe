const mongoose = require('mongoose');
const Organization = require('./organization')


const tourSchema = mongoose.Schema(
  {
    orgId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required:true,
		},
    category:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required:true,
		},
    title: {type:String, trim:true, required:true},
    startLocation:{type:String, required:true},
    destination:{type:String},
    duration:{type:String},
    description:{type:String, trim:true},
    packages:[
      {
        name: String,
        description: String,
        price: Number
      }
    ],
    personCapacity: {type:Number},
    itinerary:[
      {
        day: Number,
        activity: String,
        description: String
      }
    ],
    images:[String],
    price:{type:Number, required:true, min:0},
    bookingMoney:{type:Number},
    ratingsAverage:{type:Number, min:1, max:5, set: val => ((val * 10) / 10).toFixed(2)},
    ratingsQuantity: {type:Number, default:0},
    startDate:{type:Date},
    startTime:{type:Date},
    policy:{type:String},
    react:[],
    comments:[],
    country:{type:String},
    discountRate: {type:Number, default:0}
  },
  {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

tourSchema.index({ startDate: 1, destination: 1 });

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

tourSchema.virtual('finalPrice').get(()=> {
  return this.price - (this.discountRate || 0);
});

tourSchema.methods.isDiscounted = ()=> {
  return this.discountRate > 0;
};


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