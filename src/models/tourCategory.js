
import mongoose from 'mongoose'
import { isURL } from 'validator';

const tourCategorySchema = new mongoose.Schema({
		name: { type: String, required: true },
		imagePath: { type: String, validate: { validator: isURL, message: 'Invalid URL' } },
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.index({name:1})

categorySchema.methods.toJSON = function () {
	const category = this.toObject();
	delete category.__v;
	delete category.createdAt;
	delete category.updatedAt;
	return category;
};

const TourCategory = mongoose.model('tour-category', tourCategorySchema);
module.exports = TourCategory;
