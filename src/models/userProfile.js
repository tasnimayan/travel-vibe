const mongoose = require('mongoose');
const COUNTRY_CODES = require('../lib/countryCode');

// Creating User Schema
const userProfileSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		name: {
			type: String,
			trim: true,
			required: true,
			minLength: 2,
			maxLength: 99,
		},
    imagePath: { type: String, default: 'default.jpg' },
    bio: { type: String, maxlength: 500 },
		country: {type: String, enum: Object.keys(COUNTRY_CODES)},
		city: {type: String, trim: true, transform: (val) => val.toLowerCase()},
		address:{
			type: String,
			trim: true,
			minLength: 2,
			maxLength: 99
		},
    preferences: {
      interests: [{ type: String }], 
      preferredLanguages: [{ type: String }], 
    },
    favorites: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "Favorite" }
		],

    // Social Interactions
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Organization" }],
		isActive: { type: Boolean, default: true },
		isVerified:{type: Boolean, default: false },
  },
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }  }
);



// Method to hide unnecessary fields to 'user' role 
userProfileSchema.methods.toJSON = function () {
	const userProfile = this.toObject();

	delete userProfile.updatedAt;
	delete userProfile.isActive;
	delete userProfile.__v;
	delete userProfile.id;

	return userProfile;
};


const UserProfile = new mongoose.model('UserProfile', userProfileSchema, 'user-profile')
module.exports = UserProfile;