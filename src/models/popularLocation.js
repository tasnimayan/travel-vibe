// updated:
import mongoose from 'mongoose';

const popularLocationSchema = new mongoose.Schema(
  {
		location: { 
      type: String, 
      required: [true, 'Location name is required'],
      trim: true,
      minlength: [2, 'Location name must be at least 2 characters'],
      maxlength: [100, 'Location name cannot exceed 100 characters']
    },
		country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
			
    },
		searchCount: { 
      type: Number, 
      default: 0,
      min: [0, 'Search count cannot be negative']
    },
		lastSearchedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: false, versionKey: false }
)

popularLocationSchema.index({ searchCount: -1, country: 1})
popularLocationSchema.index({ location: 'text' })


// Static Method to give most searched 10 places
popularLocationSchema.statics.getPopular = async (limit = 10, country = nul) => {
  try {
		const query = [];
    
    // Add country filter if provided
    if (country) {
      query.push({ $match: { country } });
    }
		query.push(
      { $sort: { searchCount: -1 } },
      { $limit: limit },
			{
				$project: {
					location: 1,
					searchCount: 1,
					country: 1,
					lastSearchedAt: 1
				}
			}
    );

    const locations = await PopularLocation.aggregate(query);

    if (!locations || locations.length === 0) {
      throw new Error('No popular locations available');
    }

    return locations;
  } catch (error) {
    console.error('Error fetching popular locations:', error);
    throw error;
  }
};


popularLocationSchema.statics.increaseCount = async (locationId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      throw new Error('Invalid location ID');
    }

    const updatedLocation = await PopularLocation.findOneAndUpdate(
      { _id: locationId },
      { 
				$inc: { searchCount: 1 },
				$set: { lastSearchedAt: new Date() }
		 	},
    );

    if (!updatedLocation) {
      throw new Error('Location not found');
    }

    return updatedLocation;
  } catch (error) {
		console.error(`Error increasing search count for location: ${locationId}`, error);
    throw error;
  }
};

// Reset search count (monthly or after interval)
popularLocationSchema.statics.resetSearchCounts = async () => {
  try {
    const result = await PopularLocation.updateMany(
      {},
      { $set: { searchCount: 0 } }
    );

    return result;
  } catch (error) {
    console.error('Error resetting search counts:', error);
    throw error;
  }
};

const PopularLocation = mongoose.model('PopularLocation', popularLocationSchema)
module.exports = PopularLocation;