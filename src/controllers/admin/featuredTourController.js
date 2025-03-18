const FeaturedTour = require("../../models/featuredTour")
const { isValidObjectId } = require("../../utils")

exports.addFeaturedTour = async (req, res) => {
  const { tourId, priority, featuredType, startDate, endDate, countryCode } = req.body;

  // Input validation
  if (!isValidObjectId(tourId)) {
    return res.status(400).json({ message: "Invalid tour ID" });
  }

  if (!isValidObjectId(req.user._id) && req.user.role !== "admin") {
    return res.status(400).json({ message: "Invalid admin ID" });
  }

  if (priority < 0 || priority > 10) {
    return res.status(400).json({ message: "Priority must be between 0 and 10" });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Invalid date" });
  }

    // Create a new featured tour
  const newFeaturedTour = new FeaturedTour({
    tourId,
    priority,
    featuredType,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    countryCode,
    createdBy: req.user._id,
  });

  await newFeaturedTour.save();

  return res.status(201).json({
    message: "Tour added to featured successfully",
    data: newFeaturedTour,
  });
};


exports.getFeaturedTours = async (req, res) => {
  const { country } = req.query;

  const PAGE_SIZE = 12; // Default page size
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || PAGE_SIZE;
  const skip = (page - 1) * limit; 

  try {
    const featuredTours = await FeaturedTour.find({
      ...(country ? { country } : {}),
      isActive: true,
      endDate: { $gt: new Date() },
    })
      .populate({
        path: "tourId",
        localField: "tourId",
        foreignField: "_id",
        populate: {
          path: "category",
          select: "name",
        },
        select: "title category destination rating price currency images startDate endDate",
      })
      .select("tourId tour country")
      .sort({ priority: -1 }) // (higher priority first)
      .skip(skip)
      .limit(limit);

    // Count total documents for pagination metadata
    const total = await FeaturedTour.countDocuments({
      ...(country ? { country } : {}),
      isActive: true,
      endDate: { $gt: new Date() },
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Return response with paginated data
    return res.status(200).json({
      message: "Featured tours fetched successfully",
      data: featuredTours,
      pagination: {
        page,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching featured tours by country:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
