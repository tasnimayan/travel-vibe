const mongoose = require('mongoose')

const topDestinationSchema = new mongoose.Schema(
  {
		name: { type: String },
		image: {type: String},
		weight: { type: Number },
	},
	{ timestamps: false, versionKey:false }
)

// Static Method to give most searched 10 places
topDestinationSchema.statics.getDestinations = async () => {
	const destinations = await TopDestination.aggregate([
		{$sort:{weight:-1}},
		{$limit:10},
	])
	
	if (!destinations) {
		throw new Error('No destination available');
	}
	
	return destinations;
}

topDestinationSchema.statics.increaseWeight = async (destinationId) => {
	const id = new mongoose.Types.ObjectId(destinationId)
	const destinations = await TopDestination.updateOne(
		{_id:id},
		{$inc:{weight:1}})
	
	if (!destinations) {
		throw new Error('No destination available');
	}
	
	return destinations;
}

const TopDestination = mongoose.model('top-destinations', topDestinationSchema)
module.exports = TopDestination;