const Tour = require('../../models/tour.js')

//Tour Create Done
// Tour get Done
// Tour update Done
// Tour Delete 


exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create({
      user: req.body.user,
      title: req.body.title,
      startLocation: req.body.startLocation,
      destination: req.body.destination,
      duration: req.body.duration, 
      description: req.body.description,
      packages: req.body.packages, 
      personCapacity: req.body.capacity,
      itinerary: req.body.itinerary, 
      images: req.body.images,
      price: req.body.price, 
      bookingMoney: req.body.bookingMoney,
      startDate: req.body.startDate,
      startTime: req.body.startTime,
      policy: req.body.policy,
    });

    if (!tour) {
      return res.status(400).send();
    }

    res.status(201).send({ message: 'Tour created!', tour });
  } catch (err) {
    res.status(500).send(err.message);
  }
}


exports.getTour = async (req, res)=>{
  try {
    const tour = await Tour.findById(req.params.id).populate({
      path: 'reviews',
      select: '-__v -id',
    });

    if (!tour) {
      return res.status(404).send({ message: 'No tour found' });
    }
    res.status(200).send(tour);
  } catch (err) {
    res.status(400).send(err.message);
  }
}


exports.updateTour = async (req, res) =>{
  try {

    const id = req.params.id;

    const updateData = {
      title: req.body.title,
      startLocation: req.body.startLocation,
      destination: req.body.destination,
      duration: req.body.duration, 
      description: req.body.description,
      packages: req.body.packages, 
      personCapacity: req.body.capacity,
      itinerary: req.body.itinerary, 
      images: req.body.images,
      price: req.body.price, 
      bookingMoney: req.body.bookingMoney,
      startDate: req.body.startDate,
      startTime: req.body.startTime,
      policy: req.body.policy,
    }

    const tour = await Tour.findByIdAndUpdate( id, updateData,{new: true, runValidators: true,});

    if (!tour) {
      return res.status(404).send({ message: 'Tour not found' });
    }

    res.status(200).send({ message: 'Tour updated!', tour });
  } catch (err) {
    res.status(400).send(err.message);
  }
}


exports.deleteTour = async (req, res) =>{
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).send();
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).send(err.message);
  }
}


exports.getAllTours = async (req, res)=> {
  try {
    // npm package query-lib-vr
    const tours = await Tour.find().sort({rating:-1, price:1});

    if (tours.length === 0) {
      return res.status(200).send({ message: 'No results match this query' });
    }
    res.status(200).send({ results: tours.length, tours });
  } catch (err) {
    res.status(400).send(err.message);
  }
}






//*agreggation pipline -- best for stats
// exports.getTourStats = async (req, res) => {
//   try {

//     const stats = await Tour.aggregate([
//       {
//         $match: { ratingsAverage: { $gte: 4.7 } },
//       },

//       {
//         $group: {
//           _id: '$difficulty',
//           numTours: { $sum: 1 },
//           numRatings: { $sum: '$ratingsQuantity' },
//           avgRating: { $avg: '$ratingsAverage' },
//           avgPrice: { $avg: '$price' },
//           minPrice: { $min: '$price' },
//           maxPrice: { $max: '$price' },
//           avgDuration: { $avg: '$duration' },
//         },
//       },
//       {
//         $sort: { numTours: -1 },
//       },
//     ]);

//     if (!stats) {
//       return res.status(404).send();
//     }

//     res.status(200).send(stats);
//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// }