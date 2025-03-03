const mongoose = require('mongoose')

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
		location:{
			country: String,
			city:String,
			address:{
				type: String,
				trim: true,
				minLength: 2,
				maxLength: 99
			}
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