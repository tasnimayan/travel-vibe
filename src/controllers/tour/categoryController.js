const TourCategory = require('../../models/tourCategory');
const mongoose = require('mongoose')

// Create New category (complete)
exports.createTourCategory = async (req, res) =>{
	try {
		console.log(req.body)
		if (!req.file || !req.body.name) {
			return res.status(400).json({
					status: 'error',
					message: 'Category name and image is required'
			});
		}
		const existingCategory = await TourCategory.findOne({ 
			name: req.body.name
		}).select('_id');

		if (existingCategory) {
			return res.status(409).json({
					status: 'error',
					message: 'Category with this name already exists'
			});
		}

		let imagePath = req.file.path.replace(/\\/g,'/').slice(6);
		// Create category
		const category = await TourCategory.create({
			name: req.body.name,
			description: req.body.description,
			imagePath: imagePath,
		});

		if (!category) {
			return res.status(400).send({ status:"fail", message:"Could not create category"});
		}

		res.status(201).send({ status:'success', message:"success", data:category});
	} catch (err) {
		res.status(500).json({
			status: 'error',
			message: 'Internal server error',
			...(process.env.NODE_ENV === 'development' && { error: err.message })
		});
	}
}

// Get all the categories available (complete)
exports.getAllCategory = async function(req, res) {
	try {
			// Get all category from database 
		const categories = await Category.find();

		if (!categories) {
			return res.status(404).send({message:"No category found"});
		}

		res.status(200).send({message:"success", data:categories});
	} catch (err) {
		res.status(400).send({message:err.message});
	}
}

// Update existing category details
exports.updateCategory = async function(req, res) {
	try {
		const baseURL = req.headers.host
		let imagePath = baseURL+req.file?.path.replace(/\\/g,'/').slice(6);
    // Update fields data
		const validUpdates = {};
		req.body.categoryName? validUpdates["categoryName"] = req.body.categoryName : null
		req.file ? validUpdates["categoryImg"] = imagePath : null


		const id = new mongoose.Types.ObjectId(req.params.categoryId);
		// Category update on database
		const category = await Category.findByIdAndUpdate(
			id,
			validUpdates,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!category) {
			return res.status(404).send({message:"Could not updated category!"});
		}

		res.status(200).send({ message: 'Updates successful!', data:category });
	} catch (err) {
		res.status(400).send({message:err.message});
	}
}

// Delete a category from database (complete)
exports.deleteCategory = async (req, res) => {
	try {
    const id = new mongoose.Types.ObjectId(req.params.categoryId)
		const category = await Category.findOneAndDelete({
			_id: id
		});

		if (!category) {
			return res.status(404).send({message:"No category found"});
		}

		res.status(200).send({message:"success", data:category});
	} catch (err) {
		res.status(400).send({message:err.message});
	}
}
