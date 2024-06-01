const PopularLocation = require('../../models/popularLocation');

// Get Top location based on search (complete)
exports.getPopularLocations = async function(req, res) {
	try {
			// Get all locations from database 
		const locations = await PopularLocation.getPopular();

		if (!locations) {
			return res.status(404).send({message:"No category found"});
		}

		res.status(200).send({message:"success", data:locations});
	} catch (err) {
		res.status(400).send({message:err.message});
	}
}


// Create New category (complete)
// exports.createCategory = async (req, res) =>{
// 	try {
// 		const baseURL = req.headers.host
// 		let imagePath = baseURL+req.file.path.replace(/\\/g,'/').slice(6);
// 		// Create category
// 		const category = await Category.create({
// 			categoryName: req.body.categoryName,
// 			categoryImg: imagePath,
// 		});

// 		if (!category) {
// 			return res.status(400).send({message:"New category creation failed"});
// 		}

// 		res.status(201).send({message:"success", data:category});
// 	} catch (err) {
// 		res.status(400).send({message:err.message});
// 	}
// }

// Update existing category details
exports.increaseLocationCount = async function(req, res) {
	try {
		// increase locations count on database
		const location = await PopularLocation.increaseCount(req.params.locationId)

		if (!location) {
			return res.status(404).send({message:"Could not updated count!"});
		}

		res.status(200).send({ message: 'Updates successful!', data:location });
	} catch (err) {
		res.status(400).send({message:err.message});
	}
}
