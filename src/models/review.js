const mongoose = require('mongoose');
const Tour = require('../models/tour');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: true,
			min: 1,
			max: 250,
		},

		rating: {
			type: Number,
			required:true,
			min: 1,
			max: 5,
		},

		tour: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Tour',
			required: true,
		},

		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


// ensures only 1 tour review per user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true, sparse: true });

reviewSchema.methods.toJSON = function () {
	const review = this.toObject();

	delete review.__v;
	delete review.id;

	return review;
};

//* static method on Model to calculate & Update the average rating of a tour
reviewSchema.statics.calcAverageRating = async (tourId) => {
	// this  = Tour model
	const stats = await Review.aggregate([
		{
			$match: { tour: tourId },
		},
		{
			$group: {
				_id: '$tour',
				numOfRatings: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	]);

	await Tour.findByIdAndUpdate(tourId, {
		ratingsQuantity: stats[0].numOfRatings,
		ratingsAverage: stats[0].avgRating,
	});
};

//* QUERY MIDDLEWARE --> find queries
reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name photo',
	});

	next();
});

reviewSchema.post('save', function () {
	// this = current review doc, constructor is parent model
	this.constructor.calcAverageRating(this.tour);
});

const Review = mongoose.model('reviews', reviewSchema);
module.exports = Review;
