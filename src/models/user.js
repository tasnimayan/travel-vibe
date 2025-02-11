const mongoose = require('mongoose')
const { isEmail } = require('validator');
// const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')


// User password update does not triggers pre method

// Creating User Schema
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			minLength: 2,
			maxLength: 99,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			lowercase: true,
			validate(value) {
				if (!isEmail(value)) {
					throw new Error('Invalid email format!');
				}
			},
		},
		password: {
			type: String,
			trim: true,
			required: true,
			minlength: 6,
			validate(value) {
				if (value.toLowerCase().includes('password')) {
					throw new Error('Password cannot contain -password-');
				}
			},
		},
		address:{
			country: {type:String},
			city:{type:String},
			add:{
				type: String,
				trim: true,
				minLength: 2,
				maxLength: 99
			}

		},
		photo: {
			type: String,
			default: 'default.jpg',
		},
		userReviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Review',
			},
		],
		userTours: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Tour',
			},
		],
		token: {
			type: String,
		},
		role: {
			type: String,
			default: 'user',
		},
		active: {
			type: Boolean,
			default: true,
		},
		otp:{type: String},
		isVerified:{type: Boolean, default:false},
	
		passwordChangedAt: Date,
		resetPasswordToken: String,
		resetPasswordExpires: Date,
	},

	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }  }
);



// Method to hide unnecessary fields to 'user' role 
userSchema.methods.toJSON = function () {
	const user = this.toObject();

	if (user.role === 'user' || user.role === 'org') {
		delete user.password;
		delete user.passwordChangedAt;
		delete user.resetPasswordToken;
		delete user.resetPasswordExpires;
		delete user.createdAt;
		delete user.updatedAt;
		delete user.active;
		delete user.token;
		delete user.userReviews;
		delete user.userTours;
		delete user.__v;
		delete user.id;
	}

	return user;
};


// Static methods that can be called on Model instead of instance of model
userSchema.statics.loginUser = async (email, password) => {

	const user = await User.findOne({ email });

	if (!user || user.active === false) {
		throw new Error('Account is not active');
	}

	const match = await user.comparePassword(password, user.password);

	if (!match) {
		throw new Error("Password does not match");
	}

	return user;
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

const User = new mongoose.model('User', userSchema)
module.exports = User;