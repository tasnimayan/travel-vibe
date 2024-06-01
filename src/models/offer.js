const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema(
  {
		image: { type: String },
		coupon: { type: String },
		discountRate: { type: Number },
		discountAmount: { type: Number },
	},
	{timestamps:false}
)

const Offer = mongoose.model('offers', offerSchema)
module.exports = Offer;