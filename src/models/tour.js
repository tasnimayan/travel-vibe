const mongoose = require('mongoose');
const User = require('./user');


const tourSchema = mongoose.Schema(
  {
    user:{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
        required:true,
			},
    title: {type:String, trim:true, required:true},
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

//  Saves the tour data to the user's userTours field
tourSchema.pre('save', async function (next) {
	const user = await User.findOne({_id:this.user});
	if ( this.isNew) {
		user.userTours.push(this._id);
    await user.save()
  }
	next();
});

// Populate relational data to the output
tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name photo address',
	});
	next();
});


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;