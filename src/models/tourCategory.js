// updated:
import mongoose from 'mongoose'
import { isURL } from 'validator';

const tourCategorySchema = new mongoose.Schema({
		name: { 
			type: String, 
			required: [true, 'Category name is required'],
			trim: true,
			unique: true,
			minlength: [2, 'Category name must be at least 2 characters'],
			maxlength: [50, 'Category name cannot exceed 50 characters']
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, 'Description cannot exceed 500 characters']
		},
		imagePath: { 
			type: String, 
			required: [true, 'Category image is required'],
			validate: { 
				validator: isURL, 
				message: 'Invalid URL format for image path'
			},
		},
		isActive: {
				type: Boolean,
				default: true
		},
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourCategorySchema.index({ name: 1, slug: 1 });
tourCategorySchema.index({ parentCategory: 1 });

tourCategorySchema.methods.toJSON = function () {
	const category = this.toObject();
	delete category.__v;
	delete category.createdAt;
	delete category.updatedAt;
	return category;
};

// Pre-save middleware to generate slug
tourCategorySchema.pre('save', function(next) {
	this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
	next();
});

const TourCategory = mongoose.model('TourCategory', tourCategorySchema, 'tour_categories');
module.exports = TourCategory;
