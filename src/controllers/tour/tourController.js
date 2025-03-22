const mongoose = require("mongoose");
const Tour = require("../../models/tour");
const FavoriteTour = require("../../models/favorite");

// Process tour filters and add them to the request object
exports.processTourFilters = (req, res, next) => {
  const { search, country, status, category, minPrice, maxPrice, minRating, maxRating, hasDiscount, maxGroupSize, startDate, endDate } = req.query;

  const dateRange = {
    startDate: null,
    endDate: null,
  };

  try {
    dateRange.startDate = startDate ? new Date(startDate) : new Date();
    dateRange.endDate = endDate ? new Date(endDate) : null;
    if (isNaN(dateRange.startDate.getTime())) {
      throw new Error("Invalid date format");
    }
  } catch (err) {
    dateRange.startDate = new Date();
  }

  const filter = { startDate: { $gte: dateRange.startDate } };

  if (dateRange.endDate) {
    filter.endDate = { $lte: dateRange.endDate };
  }

  // Filter by tags
  if (search) {
    filter.tags = { $in: search.toLowerCase() };
  }

  // Filter by country
  if (country) {
    filter.country = country;
  }

  // Filter by status
  if (status) {
    filter.status = status;
  }

  // Filter by category (MongoDB ObjectID)
  if (category) {
    filter.category = new mongoose.Types.ObjectId(category);
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) {
      filter.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      filter.price.$lte = parseFloat(maxPrice);
    }
  }

  // Filter by rating range
  if (minRating || maxRating) {
    filter.rating = {};
    if (minRating) {
      filter.rating.$gte = parseFloat(minRating);
    }
    if (maxRating) {
      filter.rating.$lte = parseFloat(maxRating);
    }
  }

  // Filter by discount (tours with discounts)
  if (hasDiscount === "true") {
    filter.discountPercentage = { $gt: 0 };
  }

  // Filter by group size
  if (maxGroupSize) {
    filter.maxGroupSize = { $lte: parseInt(maxGroupSize) };
  }

  req.filter = filter;

  next();
};

// Creating New tour (complete)
exports.createTour = async (req, res) => {
  let photos;
  if (req.files) {
    photos = req.files.map((item) => item.path.replace(/\\/g, "/").slice(6));
  }
  const userId = new mongoose.Types.ObjectId(req.user._id);
  if (!userId) {
    return res.status(400).send({ status: "fail", message: "User not found" });
  }
  try {
    const {
      title,
      description,
      price,
      bookingDeposit,
      discountPercentage,
      discountAmount,
      currency,
      startDate,
      endDate,
      duration,
      destination,
      highlightedPlaces,
      maxGroupSize,
      pickupPoint,
      departureTime,
      rating,
      ratingQuantity,
      packages,
      amenities,
      itinerary,
      country,
      tags,
      status,
      isActive,
      policy,
      category,
    } = req.body;

    // Create the tour
    const tour = await Tour.create({
      title,
      description,
      price,
      bookingDeposit,
      discountPercentage,
      discountAmount,
      currency,
      startDate,
      endDate,
      duration,
      images: photos ? photos : [],
      destination,
      highlightedPlaces,
      maxGroupSize,
      pickupPoint,
      departureTime,
      rating,
      ratingQuantity,
      packages,
      amenities,
      itinerary,
      country,
      tags,
      status,
      isActive,
      policy,
      category,
      createdBy: userId,
    });

    if (!tour) {
      return res.status(400).send({ status: "fail", message: "Failed to create tour" });
    }

    res.status(201).send({ status: "success", message: "Tour created successfully!", data: tour });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: "fail", message: err.message || "Internal server error" });
  }
};

// Get All Tours with pagination (complete)
exports.getAllTours = async (req, res) => {
  try {
    // Pagination and Filtering
    const PAGE_SIZE = 6; // Default page size
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const skip = (page - 1) * limit; // Skip items for pagination

    // Fetch tours with filtering and pagination
    const tours = await Tour.find(req.filter)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "createdBy",
        localField: "createdBy",
        foreignField: "user",
        justOne: true,
        select: "-_id name profileImage rating",
      })
      .select(
        "title description price currency startDate endDate duration destination maxGroupSize highlightedPlaces images rating ratingQuantity createdBy"
      );

    const totalTours = await Tour.countDocuments(req.filter);

    const transformedTours = tours.map((tour) => {
      const tourObject = tour.toObject();
      tourObject.images = tourObject.images.length > 0 ? [tourObject.images[0]] : [];
      return tourObject;
    });

    res.status(200).json({
      status: "success",
      message: "Tours fetched successfully",
      data: transformedTours,
      pagination: {
        page: parseInt(page),
        total: totalTours,
        totalPages: Math.ceil(totalTours / limit),
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: "Internal server error", error: err.message });
  }
};

// // Get Tour details with specific TourID
exports.getTourDetails = async (req, res) => {
  try {
    const tourId = req.params.tourId;
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ status: "fail", message: "Invalid tour ID" });
    }

    // Fetch the tour and populate related fields
    const tour = await Tour.findById(tourId)
      .populate("category", "name")
      .populate({
        path: "createdBy",
        localField: "createdBy",
        foreignField: "user",
        justOne: true,
        select: "-_id name profileImage rating",
      })
      .populate("policy", "name description")
      .populate("packages", "name price");

    // If tour is not found
    if (!tour) {
      return res.status(404).json({ status: "fail", message: "Tour not found" });
    }

    // Send the tour details in the response
    res.status(200).json({
      status: "success",
      message: "Tour details fetched successfully",
      data: tour,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error", error: err.message });
  }
};

// // Update tour with TourID
// exports.updateTour = async (req, res) =>{
//   const baseURL = req.headers.host
//   try {
//     const tourId = new mongoose.Types.ObjectId(req.params.id);
//     const userId = new mongoose.Types.ObjectId(req.user._id);

//     let photos;
//     if(req.files){
//       photos = req.files.map(item => baseURL+item.path.replace(/\\/g,'/').slice(6));
//     }

//     const updateFields = ["title", "startLocation", "destination", "duration", "description", "packages","personCapacity", "itinerary", "price", "bookingMoney", "startDate", "startTime", "policy",]

//     // const tour = await Tour.findByIdAndUpdate( id, updateData,{new: true, runValidators: true,});
//     const tour = await Tour.findOne({_id:tourId, user:{$eq:userId}});

//     if (!tour) {
//       return res.status(404).send({ message: 'Tour not found' });
//     }

//     for(key in req.body){
//       if(updateFields.includes(key)){
//         tour[key] = req.body.key;
//       }
//     }

//     // tour.images.push(...photos)
//     tour.images = photos? photos: tour.images
//     await tour.save();

//     res.status(200).send({ message: 'Tour updated!', tour });
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// }

// // To view the tour booking details
// exports.tourBookings = async (req, res) => {
//   try {
//     const tour = await Tour.findById(req.params.id).populate('bookings');

//     if (!tour) {
//       return res.status(404).send();
//     }

//     res.status(200).send(tour.bookings);
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// }

// exports.getTopRatedTours = async (req, res) => {
//   try{
//     //get the matched documents from db
//     let data = await Tour.find().limit(3).sort({ratingsAverage:-1});

//     if (data.length === 0) {
//       return res.status(404).send({ message: 'No results match this query' });
//     }
//     res.status(200).send({ data });

//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// }

// // Get Discounted Tours (complete)
// exports.getDiscountedTours = async (req, res)=> {
//   try {
//     // Pagination and item Limiter
//     const PAGE_SIZE = 6;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || PAGE_SIZE;
//     const skip = (page - 1) * limit

//     let currentDate = new Date();
//     //get the matched documents from db
//     let matchStage = {
//       $match:{
//         $and:[
//           {"startDate":{$gte:currentDate}},
//           {"discountRate":{$gt:0}}
//         ]
//       }
//     }
//     // Search on Database
//     let data = await Tour.aggregate([
//       matchStage,
//       {$skip:skip},
//       {$limit:limit},
//       {$sort:{discountRate:-1}}
//     ])

//     // Get the total count for pagination
//     let count = await Tour.aggregate([
//       matchStage,
//       {$count:"totalItem"}
//     ])
//     count = count[0]?.totalItem || 0

//     if (data.length === 0) {
//       return res.status(404).send({ message: 'No results match this query' });
//     }
//     res.status(200).send({ totalPages:Math.ceil(count/limit), data:data });

//   } catch (err) {
//     console.log(err)
//     res.status(400).send(err.message);
//   }
// }

// // Delete tour with TourID (complete)
// exports.deleteTour = async (req, res) =>{
//   try {
//     const tourId = new mongoose.Types.ObjectId(req.params.id);
//     const userId = new mongoose.Types.ObjectId(req.user._id);

//     const tour = await Tour.deleteOne({_id:tourId, user:{$eq:userId}});

//     if (!tour) {
//       return res.status(404).send({message:"Error deleting tour"});
//     }
//     const rem = await User.updateOne({_id:userId}, {$pull: {userTours: tourId}})
//     res.status(200).send({message:"Success"});
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// }

// // Get tours near your location (complete)
// exports.getNearbyLocation = async (req, res) =>{
//   try {
//     // Pagination and item Limiter
//     const PAGE_SIZE = 6;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || PAGE_SIZE;
//     const skip = (page - 1) * limit

//     let country = req.query.country ?? 'bangladesh';
//     let location = req.query.location ?? '';

//     // Search on Database
//     let data = await Nearby.findOne({country:country})
//     let result = data.locations[location]??[]

//     if (result.length === 0) {
//       return res.status(404).send({ message: 'No results match this query' });
//     }
//     res.status(200).send({status:"success", data:result });

//   } catch (err) {
//     console.log(err)
//     res.status(400).send(err.message);
//   }
// }
// // Get offers image with coupon code
// exports.getOffers = async (req, res) =>{
//   try{
//     let  data = await Offer.find().limit(4)

//     if (data.length === 0) {
//       return res.status(404).send({ message: 'No Offers available' });
//     }
//     res.status(200).send({status:"success", data:data });
//   }
//   catch (err) {
//     console.log(err)
//     res.status(400).send(err.message);
//   }
// }

// Get All Tours with pagination (complete)
exports.getActivitiesTour = async (req, res) => {
  try {
    // Pagination and Filtering
    const PAGE_SIZE = 12; // Default page size
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const skip = (page - 1) * limit; // Skip items for pagination

    // Fetch tours with filtering and pagination
    const tours = await Tour.find({
      category: "67d329b4c523a039ff263649",
    })
      .skip(skip)
      .limit(limit)
      .select("title price currency duration destination maxGroupSize images");

    const totalTours = await Tour.countDocuments({ category: "67d329b4c523a039ff263649" });

    res.status(200).json({
      status: "success",
      message: "Activity fetched successfully",
      data: tours,
      pagination: {
        page: parseInt(page),
        total: totalTours,
        totalPages: Math.ceil(totalTours / limit),
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: "Internal server error", error: err.message });
  }
};

exports.getPopularTours = async (req, res) => {
  const PAGE_SIZE = 10;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || PAGE_SIZE;
  const minReviews = 5; // Default minimum reviews: 5
  const skip = (page - 1) * limit;

  try {
    // Fetch popular tours based on rating and number of reviews
    const popularTours = await Tour.find({
      startDate: { $gte: new Date() },
      isActive: true,
      rating: { $gte: 4 },
      ratingQuantity: { $gte: minReviews },
    })
      .populate({
        path: "category",
        select: "name",
      })
      .select("title category destination rating price currency images startDate endDate")
      .sort({ rating: -1, ratingQuantity: -1 })
      .skip(skip)
      .limit(limit);

    // Count total documents for pagination metadata
    const total = await Tour.countDocuments({
      rating: { $gte: 4 },
      ratingQuantity: { $gte: minReviews },
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Return response with paginated data
    return res.status(200).json({
      message: "Popular tours fetched successfully",
      data: popularTours,
      pagination: {
        page,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching popular tours:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Add or remove a tour from favorites
exports.addOrRemoveFavorite = async (req, res) => {
  const { tourId } = req.params;

  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(tourId)) {
    return res.status(400).json({ status: "fail", message: "Invalid user ID or tour ID" });
  }

  try {
    // Check if the tour is already favorited by the user
    const existingFavorite = await FavoriteTour.findOne({ user: userId, tour: tourId });

    if (existingFavorite) {
      // If it exists, remove it from favorites
      await FavoriteTour.deleteOne({ _id: existingFavorite._id });
      return res.status(200).json({ status: "success", message: "Tour removed from favorites" });
    } else {
      // If it doesn't exist, add it to favorites
      const newFavorite = new FavoriteTour({ user: userId, tour: tourId });
      await newFavorite.save();
      return res.status(200).json({ status: "success", message: "Tour added to favorites", data: newFavorite });
    }
  } catch (error) {
    console.error("Error updating favorites:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
