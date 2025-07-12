// updated:
const mongoose = require('mongoose');
const Tour = require('./tour');

const featuredTourSchema = new mongoose.Schema(
  {
		tourId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Tour',
			required: true,
		},
		// Higher number means higher priority in display order
		priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
		// Where this tour should be featured
		featuredType: {
      type: String, enum: ['homepage', 'category', 'search', 'all'], default: 'all'
    },
		startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
		isActive: { type: Boolean, default: true },
    country: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

featuredTourSchema.index({ endDate: 1, isActive: 1 });
featuredTourSchema.index({ featuredType: 1, priority: -1 });


// Middleware to check if the tour exists and is active before featuring
featuredTourSchema.pre('save', async function(next) {
  const tour = await Tour.findById(this.tourId);
  
  if (!tour) {
    throw new Error('Tour not found');
  }
  
  if (!tour.isActive) {
    throw new Error('Cannot feature an inactive tour');
  }
  
  if (this.startDate > this.endDate) {
    throw new Error('Start date cannot be after end date');
  }
  
  next();
});

const FeaturedTour = mongoose.model('FeaturedTour', featuredTourSchema);

module.exports = FeaturedTour;






/* 
// Get all active featured tours
const featuredTours = await FeaturedTour.find({
  isActive: true,
  startDate: { $lte: new Date() },
  endDate: { $gte: new Date() }
}).sort({ priority: -1 });

// Get homepage featured tours
const homepageTours = await FeaturedTour.find({
  featuredType: 'homepage',
  isActive: true,
  startDate: { $lte: new Date() },
  endDate: { $gte: new Date() }
}).sort({ priority: -1 });

*/


