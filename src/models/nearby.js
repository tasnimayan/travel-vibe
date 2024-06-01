const mongoose = require('mongoose')

const nearbySchema = new mongoose.Schema(
  {
		country: { type: String },
		locations: {},
	},
	{ timestamps: false, toJSON: { virtuals: true } }
)

const Nearby = mongoose.model('nearby-locations', nearbySchema)
module.exports = Nearby;