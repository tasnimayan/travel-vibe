const Category = require('../../models/category');
const mongoose = require('mongoose')

// Create New category (complete)
exports.createCategory = async (req, res) =>{
	try {
		const baseURL = req.headers.host
		let imagePath = baseURL+req.file.path.replace(/\\/g,'/').slice(6);
		// Create category
		const category = await Category.create({
			categoryName: req.body.categoryName,
			categoryImg: imagePath,
		});

		if (!category) {
			return res.status(400).send({message:"New category creation failed"});
		}

		res.status(201).send({message:"success", data:category});
	} catch (err) {
		res.status(400).send({message:err.message});
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
