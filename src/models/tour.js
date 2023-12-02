const mongoose = require('mongoose')


const tourSchema = mongoose.Schema(
  {
    user:{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
    title: {type:String, trim:true},
    startLocation:{type:String, required:true},
    destination:{type:String},
    duration:{type:String},
    description:{type:String, trim:true},
    packages:[{}],
    personCapacity: {type:Number},
    itinerary:[{}],
    images:[String],
    price:{type:Number, required:true, min:0},
    bookingMoney:{type:Number},
    ratingsAverage:{type:Number, min:1, max:5, set: val => Math.round(val * 10) / 10,},
    ratingsQuantity: {type:Number, default:0},
    startDate:{type:Date},
    startTime:{type:Date},
    policy:{type:String},
    react:[],
    comments:[]
  },
  {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

tourSchema.index({ ratingsAverage: 1, price: 1 });

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
	delete tour.id;

	return tour;
};

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name email photo role',
	});
	next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
