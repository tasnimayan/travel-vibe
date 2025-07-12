const Location = require('../../models/location');
const mongoose = require('mongoose');
exports.getPopularLocations = async (req, res) => {
  try {
    // Extract query parameters
    const { limit, country, select, populateCategories } = req.query;

    const popularLocations = await Location.getPopularLocations({
      limit: parseInt(limit) || 10, 
      country: country || null,
      select: select || 'name description thumbnail',
      populateCategories: populateCategories === 'true',
    });

    // Send the response
    res.status(200).json({
      status: "success",
      message: 'Popular locations fetched successfully',
      data: popularLocations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: 'Internal server error', error: err.message });
  }
};

exports.incrementLocationWeight = async (req, res) => {
  try {
    const locationId = req.params.locationId;
    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      throw new Error('Invalid location ID');
    }
    await Location.incrementWeight(locationId);

    res.status(200).send();
  } catch (err) {
    res.status(500).send()
  }
};


exports.getTouristAttractions = async (req, res) => {

	const categoryIds = ["67cc1ffdf58bc6d0df021f7b", "67cc1ffdf58bc6d0df021f71", "67cc1ffdf58bc6d0df021f74"]
 
  const { country, city } = req.query;

  const PAGE_SIZE = 10
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || PAGE_SIZE;
  const skip = (page - 1) * limit;

  
    try {
      for (const categoryId of categoryIds) {
        if (!mongoose.isValidObjectId(categoryId)) {
          return res.status(400).json({ message: `Invalid category ID: ${categoryId}` });
        }
      }
  
      // Build the query
      const query = {
        categories: { $in:["67cc1ffdf58bc6d0df021f7b", "67cc1ffdf58bc6d0df021f71", "67cc1ffdf58bc6d0df021f74"] }, // Match any of the provided category IDs
        isActive: true,
        ...(country && { country }), 
        ...(city && { city }),
      };
  
      // Fetch locations
      const locations = await Location.aggregate([
        {$match:{
          categories: {$in: ["67cc1ffdf58bc6d0df021f7b", "67cc1ffdf58bc6d0df021f74"]}}
        },
        {$project: {name:1, thumbnail:1, thingsToSee:1, country:1, city:1}},
        {$sort: {weight: -1}},
        {$skip: skip},
        {$limit: limit},
      ])

  
      // Count total documents for pagination
      const total = await Location.countDocuments(query);
  
      return res.status(200).json({
        message: "Locations fetched successfully",
        data: locations,
        pagination: {
          page: parseInt(page),
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching locations by categories:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };