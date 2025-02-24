const mongoose = require('mongoose')
// const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')


// User password update does not triggers pre method

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

    // Bookings History
    // bookings: {
    //   tourBookings: [{ type: Schema.Types.ObjectId, ref: "TourBooking" }],
    //   guideBookings: [{ type: Schema.Types.ObjectId, ref: "GuideBooking" }],
    //   hotelBookings: [{ type: Schema.Types.ObjectId, ref: "HotelBooking" }],
    // },

    // Bookmarked posts (Tours, Hotels, Guides)
    favorites: [
			{ type: Schema.Types.ObjectId, ref: "Favorite" }
		],

    // Social Interactions
    following: [{ type: Schema.Types.ObjectId, ref: "Organization" }],
		isActive: { type: Boolean, default: true },
		isVerified:{type: Boolean, default: false },
  },
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }  }
);



// Method to hide unnecessary fields to 'user' role 
userSchema.methods.toJSON = function () {
	const userProfile = this.toObject();

	delete userProfile.updatedAt;
	delete userProfile.isActive;
	delete userProfile.__v;
	delete userProfile.id;

	return userProfile;
};



// Static method to validate Authentication Token
userSchema.statics.validateToken = async function (token) {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	const user = await User.findOne({ _id: decoded._id });
	if (!user) {
		throw new Error("Invalid token");
	}

	return user.toJSON();
};

// Custom method to generate token for authentication when user logs in or create account
userSchema.methods.generateToken = async function () {
	const user = this;

	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES,
	});

	user.token = token;
	await user.save();

	return token;
};

userSchema.methods.createPasswordResetToken = async function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	//hashing the reset token
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.resetPasswordExpires = Date.now() + 1000 * 60 * 30; //30 min
	return resetToken;
};

// // Comparing password with hashed one
// userSchema.methods.comparePassword = async function (plainPw, userPw) {
// 	return await bcrypt.compare(plainPw, userPw);
// };


// //* pre-save HASH hook --> works on create-save-update
// userSchema.pre('save', async function (next) {
// 	const user = this;

// 	if (user.isModified('password') || user.isNew) {
// 		user.password = await bcrypt.hash(user.password, 10);
// 		user.passwordChangedAt = Date.now() - 1000;
// 	}
// 	next();
// });

// =================== This code block is to replace bcrypt that does not supported in shared hosting
// Comparing password with hashed one

userSchema.methods.comparePassword = async function (plainPw, userPw) {
	if (hashPassword(plainPw) === userPw) {
		return true;
	}
	return false;
};


const hashPassword = password => {
	return crypto.createHash('sha256').update(password).digest('hex')
}
//* pre-save HASH hook --> works on create-save-update
userSchema.pre('save', async function (next) {
	const user = this;
	
	if (user.isModified('password') || user.isNew) {
		user.password = await hashPassword(user.password);
		user.passwordChangedAt = Date.now() - 1000;
	}
	next();
});

// ==============================================

const User = new mongoose.model('UserProfile', userProfileSchema)
module.exports = User;