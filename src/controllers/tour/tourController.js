
const Tour = require('../../models/tour');
const mongoose = require('mongoose')

// Process tour filters and add them to the request object
exports.processTourFilters = (req, res, next) => {
  const filter = { startDate: { $gte: new Date() } };

  // Filter by tags
  if (req.query.search) {
    filter.tags = { $in: req.query.search.toLowerCase() };
  }

  // Filter by country
  if (req.query.country) {
    filter.country = req.query.country;
  }

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by category (MongoDB ObjectID)
  if (req.query.category) {
    filter.category = new mongoose.Types.ObjectId(req.query.category);
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) {
      filter.price.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.price.$lte = parseFloat(req.query.maxPrice);
    }
  }

  // Filter by rating range
  if (req.query.minRating || req.query.maxRating) {
    filter.rating = {};
    if (req.query.minRating) {
      filter.rating.$gte = parseFloat(req.query.minRating);
    }
    if (req.query.maxRating) {
      filter.rating.$lte = parseFloat(req.query.maxRating);
    }
  }

  // Filter by discount (tours with discounts)
  if (req.query.hasDiscount === 'true') {
    filter.discountPercentage = { $gt: 0 };
  }

  // Filter by group size
  if (req.query.maxGroupSize) {
    filter.maxGroupSize = { $lte: parseInt(req.query.maxGroupSize) };
  }

  req.filter = filter;

  next();
};

// Creating New tour (complete)
exports.createTour = async (req, res) => {
  let photos;
  if (req.files) {
    photos = req.files.map(item => item.path.replace(/\\/g, '/').slice(6));
  }
  const userId = new mongoose.Types.ObjectId(req.user._id);
  if(!userId){
    return res.status(400).send({ status:"fail", message: "User not found" });
  }
  try {
    const {
      title,
      description,
      price,
      bookingDeposit,
      discountPercentage,
      // discountAmount,
      currency,
      startDate,
      endDate,
      duration,
      startingLocation,
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
      // discountAmount,
      currency,
      startDate,
      endDate,
      duration,
      images: photos ? photos : [],
      startingLocation,
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
      return res.status(400).send({ status:"fail", message: "Failed to create tour" });
    }

    res.status(201).send({ status:"success", message: 'Tour created successfully!', data: tour });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status:"fail", message: err.message || 'Internal server error' });
  }
};

// Get All Tours with pagination (complete)
exports.getAllTours = async (req, res) => {
  try {
    // Pagination and Filtering
    const PAGE_SIZE = 12; // Default page size
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const limit = parseInt(req.query.limit) || PAGE_SIZE; // Items per page (default: 12)
    const skip = (page - 1) * limit; // Skip items for pagination

    // Fetch tours with filtering and pagination
    const tours = await Tour.find(req.filter)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name') 
      .populate('createdBy', 'name email')
      .select('title description price currency startDate endDate duration startingLocation maxGroupSize highlightedPlaces images')

    const totalTours = await Tour.countDocuments(req.filter);

    res.status(200).json({
      status: 'success',
      message: 'Tours fetched successfully',
      data: {
        tours,
        totalTours,
        totalPages: Math.ceil(totalTours / limit),
        currentPage: page,
      },
      
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

// // Get Tour details with specific TourID
exports.getTourDetails = async (req, res) => {
  try {
    const tourId = req.params.tourId;
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid tour ID' });
    }

    // Fetch the tour and populate related fields
    const tour = await Tour.findById(tourId)
      .populate('category', 'name') // Populate category name
      .populate('createdBy', 'name email') // Populate organization details
      .populate('policy', 'name description') // Populate policy details
      .populate('packages', 'name price'); // Populate package details (if applicable)

    // If tour is not found
    if (!tour) {
      return res.status(404).json({ status: 'fail', message: 'Tour not found' });
    }

    // Send the tour details in the response
    res.status(200).json({
      status: 'success',
      message: 'Tour details fetched successfully',
      data: tour,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
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




// // Queried tours | query with _location_country_startDate_  (complete)
// exports.SearchTour = async (req, res) => {
//   let searchedCountry = req.query.country || ''
//   let searchedLocation = req.query.location || ''
  
//   const PAGE_SIZE = 6;
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || PAGE_SIZE;
//   const skip = (page - 1) * limit
  
//   try{
//     let searchDate = req.query.startDate? new Date(req.query.startDate.toString()) : new Date();
//     console.log(`country:${searchedCountry}, location:${searchedLocation}, date:${searchDate}`)

//     // Match Tours of specific country
//     let matchWithCountry = {
//       $match:{
//         $and:[
//           {"startDate":{$gte:searchDate}},
//           {"country":searchedCountry}
//         ]
//       }
//     }
//     // Match Tours of specific location
//     let matchWithLocation = {
//       $match:{
//         $and:[
//           {"startDate":{$gte:searchDate}},
//           {$or:[{"title":{$regex:".*"+searchedLocation+".*", $options:"i"}}, {"destination":{$regex:".*"+searchedLocation+".*", $options:"i"}}]}
//         ]
//       }
//     }
//     // Match Tours of specific country and location
//     let matchWithCountryLocation = {
//       $match:{
//         $and:[
//           {"startDate":{$gte:searchDate}},
//           {"country":searchedCountry},
//           {$or:[{"title":{$regex:".*"+searchedLocation+".*", $options:"i"}}, {"destination":{$regex:".*"+searchedLocation+".*", $options:"i"}}]}
//         ]
//       }
//     }

//     let matchStage = searchedCountry ? searchedLocation? matchWithCountryLocation: matchWithCountry : matchWithLocation

//     let data = await Tour.aggregate([
//       matchStage,
//       {$lookup: {from:"organizations", localField:"orgId", foreignField:"_id", as:"orgData", pipeline: [
//         {$project:{'name':1, 'photo':1}},
//       ]}},
//       {$unwind:"$orgData"},
//       // {$project:{"comments":0, "packages":0, "policy":0, "react":0}},
//       {$skip:skip},
//       {$limit:limit},
//     ])

//     let count = await Tour.aggregate([
//       matchStage,
//       {$count:"totalItem"}
//     ])
    
//     count = count[0]?.totalItem || 0

//     if (data.length === 0) {
//       return res.status(404).send({ data:"", message: 'No results match this query' });
//     }
//     res.status(200).send({ totalPages:Math.ceil(count/limit), data:data });

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
