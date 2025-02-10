const mongoose = require('mongoose')

const destinationSchema = new mongoose.Schema(
  {
		name: { type: String, required: true, trim: true, unique: true },
		imagePath: {type: String, required: true},
		country: { type: String, required: true, trim: true},
		bestTimeToVisit: {
      from: { type: String },
      to: { type: String }
    },
    categories: [{
      type: String,
      enum: ['beach', 'mountain', 'city', 'historical', 'cultural', 'adventure', 'wildlife']
    }],
    weight: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
	},
	{ timestamps: false, versionKey:false }
)

destinationSchema.index({ weight: -1 });
destinationSchema.index({ name: 1, country: 1 }, { unique: true });

// Method to get destinations by category
destinationSchema.statics.getDestinationsByCategory = async function(category) {
  return await this.find({ 
    categories: category,
    isActive: true 
  }).sort({ weight: -1 }).limit(10);
};

// Method to get destinations by country
destinationSchema.statics.getDestinationsByCountry = async function(country) {
  return await this.find({ 
    country,
    isActive: true 
  }).sort({ weight: -1 });
};

// Static Method to give most searched 10 places
destinationSchema.statics.getDestinations = async () => {
	const destinations = await Destination.aggregate([
		{$sort:{weight:-1}},
		{$limit:10},
	])
	
	if (!destinations) {
		throw new Error('No destination available');
	}
	
	return destinations;
}

destinationSchema.statics.increaseWeight = async (destinationId) => {
	const id = new mongoose.Types.ObjectId(destinationId)
	const destinations = await Destination.updateOne(
		{ _id: id },
		{ $inc: { weight: 1 }})
	
	if (!destinations) {
		throw new Error('No destination available');
	}
	
	return destinations;
}

const Destination = mongoose.model('Destination', destinationSchema)
module.exports = Destination;