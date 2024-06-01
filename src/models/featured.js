const mongoose = require('mongoose')

const featuredSchema = new mongoose.Schema(
  {
		tour: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Tour',
			required: true,
		},
		duration: { type: Date },
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

const Featured = mongoose.model('featured', featuredSchema)
module.exports = Featured;