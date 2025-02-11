// updated:
import mongoose from 'mongoose'

const nearbySchema = new mongoose.Schema(
  {
		name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true 
    },
		location: {
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point'
			},
			coordinates: {
        type: [Number], // [longitude, latitude]
        // required: true,
        validate: {
          validator: function (value) {
            // Validate latitude and longitude
            return (
              value.length === 2 &&
              value[0] >= -180 && value[0] <= 180 && // Longitude range
              value[1] >= -90 && value[1] <= 90 // Latitude range
            );
          },
          message: 'Invalid coordinates. Longitude must be between -180 and 180, and latitude between -90 and 90.',
        },
      },
		},

		country: {  type: String,  required: true,  trim: true },
    city: {   type: String,   trim: true },
    images: [{  type: String,  trim: true }],
    tags: [{  type: String,   trim: true }],
    rating: {  type: Number,   min: 1,   max: 5,  default: 0 },
    ratingCount: {  type: Number,  default: 0 },
    thingsToSee: [String],
    suggestedActivities: [String],
		isActive: {  type: Boolean,  default: true },

    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin', 
      required: true 
    },
	},
	{ timestamps: false, toJSON: { virtuals: true } }
)

const Location = mongoose.model('Location', nearbySchema)
module.exports = Location;