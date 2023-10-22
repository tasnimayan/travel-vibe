const mongoose = require('mongoose')


const tourSchema = mongoose.Schema(
  {
    title: {type:String, trim:true},
    startLocation:{type:String, required:true},
    destination:{type:String},
    duration:{type:String},
    description:{type:String, trim:true},
    maxPerson: {type:Number},
    itinerary:[{}],
    images:[String],
    price:{type:Number, required:true, min:0},
    bookingMoney:{type:Number},
    rating:{type:Number, min:1, max:5},
    ratingQuantity: {type:Number, default:0},
    startDate:{type:Date}
  },
  {
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

const TourModel = mongoose.model('tours', tourSchema);

module.exports = TourModel;