// updated:
const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema(
  {
		name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxLength: 80 },
    country: {  type: String,  required: true,  trim: true },
    city: {   type: String,   trim: true },
    images: [{  type: String,  trim: true }],
		thumbnail: { type: String, trim: true },
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
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TourCategory'
    }],

    weight: { type: Number, default: 0 },
    tags: [{  type: String,   trim: true }],
    rating: {  type: Number,   min: 1,   max: 5,  default: 0 },
    ratingCount: {  type: Number,  default: 0 },
    thingsToSee: [String],
    suggestedActivities: [String],
		
    isActive: {  type: Boolean,  default: true },
		lastSearchedAt: {
      type: Date,
      default: null
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin', 
      required: true 
    },
	},
	{ timestamps: false, toJSON: { virtuals: true } }
)

// Indexes
locationSchema.index({ weight: -1 });
locationSchema.index({ name: 1, country: 1 }, { unique: true });
locationSchema.index({ location: '2dsphere' });

locationSchema.virtual('categoryDetails', {
  ref: 'TourCategory',
  localField: 'categories',
  foreignField: '_id',
  justOne: true
});

/**
* Get Most Popular Locations
* This method can be used to get popular locations, place (only name), get locations by country, 

*@param {object} options -limit, country, select, populateCategories
*@example const popularLocations = await Location.getPopularLocations();
*@example const popularLocations = await Location.getPopularLocations({ limit: 10, country: 'Thailand' });
*@example const popularLocations = await Location.getPopularLocations({ select: 'name' });
*/
locationSchema.statics.getPopularLocations = async function(options = {}) {
  const {
    limit = 10,
    country = null,
    select = 'name description thumbnail',
    populateCategories = true
  } = options;

  const query = {
    isActive: true,
    ...(country && { country })
  };
  
  let queryChain = this.find(query)
    .select(select)
    .sort({ weight: -1 })
    .limit(limit);

  if (populateCategories && select.includes('categories')) {
    queryChain = queryChain.populate('categories', 'name');
  }

  return await queryChain;
};

/**
 * Get Locations by Category
 * @param {string} categoryId - The category ID to search for
 * @param {Object} options - Optional parameters
 * @returns {Promise<Array>} Array of locations matching the category
 * 
 * @example const locations = await Location.getLocationsByCategory('categoryId');
 * @example const locations = await Location.getLocationsByCategory('categoryId', { 
 *   limit: 20, 
 *   select: 'name thumbnail' 
 * });
 */
locationSchema.statics.getLocationsByCategory = async function(categoryId, options = {}) {
  const {
    limit = 10,
    select = 'name description country thumbnail location categories rating',
    sort = { weight: -1 }
  } = options;

  return await this.find({
    categories: categoryId,
    isActive: true
  })
    .select(select)
    .sort(sort)
    .limit(limit)
};


/**
 * Get Nearby Locations
 * @param {Array<number>} coordinates - [longitude, latitude] of the user's location
 * @param {number} options.maxDistance - Maximum distance in meters (default: 10000 = 10km)
 * @param {number} options.limit - Maximum number of results (default: 10)
 * 
 * @example
 * const nearby = await Location.getNearbyLocations(
 *   [100.501762, 13.756331], // Bangkok coordinates
 *   { maxDistance: 5000 }
 * );
 */
locationSchema.statics.getNearbyLocations = async function(coordinates, options = {}) {
  const {
    maxDistance = 10000, // 10km default radius
    limit = 10,
  } = options;

  return await this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: coordinates // [longitude, latitude]
        },
        distanceField: 'distance', // Adds calculated distance to each doc
        maxDistance: maxDistance,
        spherical: true,
        query: { isActive: true }
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        thumbnail: 1,
        location: 1,
        categories: 1,
        distance: 1, // Distance in meters
        distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 1] } // Convert to km
      }
    },
    { $limit: limit }
  ]);
};


/**
 * Increment location weight and update lastSearchedAt
 * @param {string} locationId - The ID of the location
 * 
 * @example await Location.incrementWeight('locationId');
 */
locationSchema.statics.incrementWeight = async function(locationId) {
  return await this.findByIdAndUpdate(
    locationId,
    {
      $inc: { weight: 1 },
      $set: { lastSearchedAt: new Date() }
    },
    { 
      new: true,  // Return the updated document
      select: 'name weight lastSearchedAt'
    }
  );
};




// // Reset search count (monthly or after interval)
// popularLocationSchema.statics.resetWeights = async () => {
//   try {
//     const result = await PopularLocation.updateMany(
//       {},
//       { $set: { weight: 0 } }
//     );

//     return result;
//   } catch (error) {
//     console.error('Error resetting search counts:', error);
//     throw error;
//   }
// };


const Location = mongoose.model('Location', locationSchema)

module.exports = Location;