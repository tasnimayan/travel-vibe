// updated:
const mongoose = require('mongoose');
const Tour = require('./tour');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: true,
			trim: true,
			minLength: [1, 'Review can not be empty'],
			maxLength: [1000, 'Review cannot exceed 1000 characters']
		},
		rating: {
			type: Number,
			required:true,
			min: 1,
			max: 5,
		},
		photos: [{
			id: String,
			url: String,
		}],
		isVerifiedBooking: {
			type: Boolean,
			default: false
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected', 'reported'],
			default: 'approved'
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
		response: {
			content: String,
			respondedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Organization',
					required: true,
			},
			respondedAt: Date
		}
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, versionKey: false }
);


// ensures only 1 tour review per user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true, sparse: true });

reviewSchema.methods.toJSON = function () {
	const review = this.toObject();
	delete review.id;

	return review;
};

//* static method on Model to calculate & Update the average rating of a tour
reviewSchema.statics.calcAverageRating = async (tourId) => {
	// this  = Tour model
	const stats = await TourReview.aggregate([
		{
			$match: { 
				tour: tourId,
				status: 'approved'
			},
			
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
		ratingQuantity: stats[0].numOfRatings,
		rating: stats[0].avgRating,
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

const TourReview = mongoose.model('TourReview', reviewSchema, 'tour_reviews');
module.exports = TourReview;
