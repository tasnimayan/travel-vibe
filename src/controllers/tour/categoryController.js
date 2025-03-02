const TourCategory = require('../../models/tourCategory');
const Tour = require('../../models/tour');
const mongoose = require('mongoose')
const util = require('util')
const fs = require('fs')
const unlink = util.promisify(fs.unlink)
const path = require('path');


// Create New category (complete)
exports.createTourCategory = async (req, res) =>{
	try {
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
		const page = parseInt(req.query.page, 10) || 1;
		const limit = req.query.limit ? parseInt(req.query.limit, 10) : Infinity;
		const skip = (page - 1) * limit;

		const categories = await TourCategory.find({isActive: true}).limit(limit).skip(skip)

		if (!categories.length) {
			return res.status(404).send({status:"fail", message:"No categories found"});
		}

		res.status(200).send({status:"success", message:"Categories", data:categories});
	} catch (err) {
		res.status(500).json({
			status: 'error',
			message: 'Internal server error',
			...(process.env.NODE_ENV === 'development' && { error: err.message })
		});
	}
}

// Update existing category details
exports.updateCategory = async function(req, res) {
	try {
		const categoryId = new mongoose.Types.ObjectId(req.params.categoryId);
		let updates = {};
		if(!mongoose.isValidObjectId(categoryId)){
			return res.status(400).json({
				status: 'fail',
				message: 'Invalid category ID'
			});
		}

		if (req.body.categoryName) {
			// Check if new name already exists (excluding current category)
			const existingCategory = await TourCategory.findOne({
				name: req.body.categoryName,
			}).select('_id');

			if (existingCategory.length) {
				return res.status(409).json({
					status: 'fail',
					message: 'Category with this name already exists'
				});
			}
			updates.name = req.body.categoryName.trim();
		}

		if(req.file) {
			const imagePath = req.file?.path.replace(/\\/g,'/').slice(6);
			updates.imagePath = imagePath;
		}
		if (req.body.description !== undefined) {
			updates.description = req.body.description.trim();
		}
		if (req.body.isActive !== undefined) {
			updates.isActive = req.body.isActive;
		}

		// Category update on database
		const category = await TourCategory.findByIdAndUpdate(
			categoryId,
			updates,
			{ new: true, runValidators: true }
		);

		if (!category) {
			return res.status(404).send({status:"fail", message:"Could not updated category!"});
		}

		res.status(200).send({ status:"success", message: 'category updated', data:category });
	} catch (err) {
		res.status(500).json({
			status: 'error',
			message: 'Internal server error',
			...(process.env.NODE_ENV === 'development' && { error: err.message })
		});
	}
}

// Delete a category from database (complete)
exports.deleteCategory = async (req, res) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid category ID'
			});
		}
		const category = await TourCategory.findById(req.params.categoryId);

		if (!category) {
			return res.status(404).json({
				status: 'fail',
				message: 'Category not found'
			});
		}

		// Check if category has associated tours before deletion
		const hasAssociatedTours = await Tour.exists({ category: req.params.categoryId });
		if (hasAssociatedTours) {
			return res.status(409).json({
				status: 'fail',
				message: 'Cannot delete category with associated tours'
			});
		}
		try {
			const imageUrl = path.join(__dirname, '../../../public/', category.imagePath);
			await unlink(imageUrl);
		} catch (fileErr) {
				console.error('Error deleting image file:', fileErr);
		}
			
		await category.deleteOne();

		res.status(200).json({
			status: 'success',
			message: 'Category deleted successfully'
		});

	} catch (err) {
		res.status(400).send({message:err.message});
	}
}
