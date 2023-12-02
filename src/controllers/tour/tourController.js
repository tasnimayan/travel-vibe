const upload = require('../../helpers/multer.js');
const Tour = require('../../models/tour.js')

//Tour Create Done
// Tour get Done
// Tour update Done
// Tour Delete 

exports.topFiveTours = async (req, res, next) =>{
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage_price';
  req.query.fields = 'name_price_ratingsAverage_duration_difficulty_summary';
  next();
}

exports.longestFiveTours = async (req, res, next) =>{
  req.query.limit = '5';
  req.query.sort = '-duration';
  req.query.fields = 'name_price_ratingsAverage_duration_difficulty_summary';
  next();
}

// Get all tours
exports.getAllTours = async (req, res)=> {
  try {
    // const tours = await qsHelper(Tour, req, res);
    const tours = await Tour.find();

    if (tours.length === 0) {
      return res.status(200).send({ message: 'No results match this query' });
    }
    res.status(200).send({ results: tours.length, tours });
  } catch (err) {
    res.status(400).send(err.message);
  }
}

// Creating New tour
exports.createTour = async (req, res) => {

  const photos = req.files;
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
      images: photos,
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

// Get Tour details with specific TourID
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

// Update tour with TourID
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

// Delete tour with TourID
exports.deleteTour = async (req, res) =>{
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).send({message:"Error deleting tour"});
    }
    res.status(200).send({message:"Success"});
  } catch (err) {
    res.status(400).send(err.message);
  }
}



async function getQueriedTours(req, res) {
  const queryString = { ...req.query };

  // exclude everything other than match field -> later chain methods on found document
  ['page', 'sort', 'limit', 'fields', 'skip'].forEach(
    el => delete queryString[el]
  );

  //regEx filtering with >, =>, <, =<
  let match = JSON.stringify(queryString);
  match = match.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

  try{
    //get the matched documents from db
    let QUERIES = Tour.find(JSON.parse(match));

    // Chain  methods


    const sort = req.query.sort || {};

    //* PAGINATION

    const PAGE_SIZE = 5;
    const page = req.query.page || 1;
    const limit = req.query.limit || PAGE_SIZE;
    const skip = (page - 1) * PAGE_SIZE || 0;

    //resolve the promise and finish query
    const result = await QUERIES.skip(skip).limit(limit).sort(sort);

    if (result.length === 0) {
      return res.status(200).send({ message: 'No results match this query' });
    }
    res.status(200).send({ results: tours.length, result });

  } catch (err) {
    res.status(400).send(err.message);
  }
}
