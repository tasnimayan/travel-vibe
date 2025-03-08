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