const Guide = require('../../models/guide')
const mongoose = require('mongoose')

// ========== Get Specific guide details ===========
exports.getGuideDetails = async (req, res) =>{

  const guideId = new mongoose.Types.ObjectId(req.params.guideId)
  try {
    const guide =await Guide.findOne({_id:guideId},{'__v':0, 'password':0, 'isActive':0, 'createdAt':0, 'updatedAt':0})

    if (!guide) {
      return res.status(404).send({ message: 'No user found!' });
    }

    res.status(200).send({data:guide});
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
}



// Get All guide with pagination (complete)
exports.getAllGuides = async (req, res)=> {
  try {
    // Pagination and item Limiter
    const PAGE_SIZE = 8;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || PAGE_SIZE;
    const skip = (page - 1) * limit || 0;

    let matchStage = {
      $match:{"isActive":true}
    }

    // Search on Database
    let data = await Guide.aggregate([
      matchStage,
      {$project:{name:1, address:1, socials:1, photo:1}},
      {$skip:skip},
      {$limit:limit},
    ])

    // Get the total count for pagination
    let count = await Guide.find({
      "isActive":true}).count()
    
    if (data.length === 0) {
      return res.status(404).send({ message: 'No results match this query' });
    }
    res.status(200).send({ totalPages:Math.ceil(count/limit), data:data });

  } catch (err) {
    console.log(err)
    res.status(400).send(err.message);
  }
}

// Queried tours | query with _location_country_startDate_  (complete)
exports.getSearchedGuide = async (req, res) => {
  let query = {}
  if(req.query.location){
    query['locations'] ={ $regex: req.query.location, $options: 'i' }; 
  }
  if(req.query.country){
    query['address.country'] = req.query.country 
  }
  if(req.query.language){
    query['language'] = req.query.language 
  }
  
  const PAGE_SIZE = 6;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || PAGE_SIZE;
  const skip = (page - 1) * limit || 0;
  
  try{
    let data = await Guide.find(query,{name:1, address:1, socials:1, photo:1}).skip(skip).limit(limit)

    let count = await Guide.find(query).count()

    if (data.length === 0) {
      return res.status(404).send({ data:"", message: 'No results match this query' });
    }
    res.status(200).send({ totalPages:Math.ceil(count/limit), data:data });

  } catch (err) {
    res.status(400).send(err.message);
  }
}
