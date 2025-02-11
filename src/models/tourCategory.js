// updated:
import mongoose from 'mongoose'
import { isURL } from 'validator';

const tourCategorySchema = new mongoose.Schema({
		name: { type: String, required: true },
		imagePath: { type: String, validate: { validator: isURL, message: 'Invalid URL' } },
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourCategorySchema.index({name:1})

tourCategorySchema.methods.toJSON = function () {
	const category = this.toObject();
	delete category.__v;
	delete category.createdAt;
	delete category.updatedAt;
	return category;
};

const TourCategory = mongoose.model('TourCategory', tourCategorySchema, 'tour_categories');
module.exports = TourCategory;
