const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
	{
		categoryName: { type: String, required: true },
		categoryImg: { type: String },
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.methods.toJSON = function () {
	const category = this.toObject();
	delete category.__v;
	delete category.createdAt;
	delete category.updatedAt;
	return category;
};

const Category = mongoose.model('category', categorySchema);
module.exports = Category;
