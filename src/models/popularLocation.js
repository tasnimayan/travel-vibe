const mongoose = require('mongoose')

const popularLocationSchema = new mongoose.Schema(
  {
		location: { type: String },
		searchCount: { type: Number },
	},
	{ timestamps: false, versionKey:false }
)

// Static Method to give most searched 10 places
popularLocationSchema.statics.getPopular = async () => {
	const locations = await PopularLocation.aggregate([
		{$sort:{searchCount:-1}},
		{$limit:10},
	])
	
	if (!locations) {
		throw new Error('No places available');
	}
	
	return locations;
}

popularLocationSchema.statics.increaseCount = async (locationId) => {
	const id = new mongoose.Types.ObjectId(locationId)
	const locations = await PopularLocation.updateOne(
		{_id:id},
		{$inc:{searchCount:1}})
	
	if (!locations) {
		throw new Error('No places available');
	}
	
	return locations;
}

const PopularLocation = mongoose.model('popular-locations', popularLocationSchema)
module.exports = PopularLocation;