const Guide = require("../../models/guide");
const mongoose = require("mongoose");

/**
 * Get guides with filtering
 * @param {Object} filters - Filters for querying guides (country, city, languages, expertise, pricePerHour, isVerified)
 * @param {Object} options - Pagination options (page, limit)
 * @returns {Object} - Paginated guides data in GuideDataType format
 */
// complete (v2)
exports.getGuides = async (req, res) => {
  const { country, city, language, expertise, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  try {
    const query = {
      isActive: true,
      isVerified: true,
      ...(country && { country }),
      ...(city && { city }),
      ...(language && { languages: language }),
      ...(expertise && { expertise: { $in: expertise.split(",") } }),
      ...(minPrice && maxPrice && { pricePerHour: { $gte: minPrice, $lte: maxPrice } }),
    };

    const guides = await Guide.find(query)
      .select("name avatar averageRating reviewCount country city languages bio servingLocations expertise pricePerHour")
      .sort({ averageRating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Count total documents for pagination
    const total = await Guide.countDocuments(query);

    // Return response with paginated data
    return res.status(200).json({
      message: "Guides fetched successfully",
      data: guides,
      pagination: {
        page: parseInt(page),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching guides:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ========== Get Specific guide details ===========
/**
 * Get guide details by ID
 * @param {string} guideId - The ID of the guide
 * @returns {Object} - Guide details for the profile page
 */
exports.getGuideDetails = async (req, res) => {
  const { guideId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(guideId)) {
      return res.status(400).json({ message: "Invalid guide ID" });
    }

    const guide = await Guide.findById(guideId)
      .select(
        "name avatar bio languages expertise servingLocations pricePerHour averageRating reviewCount country city address phone availability isVerified totalServedCount"
      )
      .populate({
        path: "userId",
        localField: "userId",
        foreignField: "_id",
        as: "guide",
        select: "email",
      });

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    // Return the guide details
    return res.status(200).json({
      message: "Guide details fetched successfully",
      data: guide,
    });
  } catch (error) {
    console.error("Error fetching guide details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
