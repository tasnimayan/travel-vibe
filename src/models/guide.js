const mongoose = require('mongoose')
const { isEmail } = require('validator');
// const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

// Creating User Schema
const guideSchema = new mongoose.Schema(
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

		bio:{type:String},
		address:{
			country: {type:String},
			city:{type:String},
			zip:{type:String},
			addressLine:{
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
		locations:[{type:String}],
		nid:{type:String},
		phone:{type:String},
		language:[{type:String}],
		education:{type:String},
		isAvailable:{type:String},
		isActive: {
			type: Boolean,
			default: true,
		},
		otp:{type: String},
		servedCount:{type: Number},
		rating:{type: Number},
		isVerified:{type: Boolean, default:false},
	},

	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }  }
);



// Method to hide unnecessary fields to 'user' role 
guideSchema.methods.toJSON = function () {
	const user = this.toObject();

	if (user.role === 'user' || user.role === 'org') {
		delete user.password;
		delete user.createdAt;
		delete user.updatedAt;
		delete user.active;
		delete user.__v;
		delete user.id;
	}

	return user;
};


// Static methods that can be called on Model instead of instance of model
guideSchema.statics.loginUser = async (email, password) => {

	const guide = await Guide.findOne({ email });

	if (!guide || guide.active === false) {
		throw new Error('Account is not active');
	}

	const match = await guide.comparePassword(password, guide.password);

	if (!match) {
		throw new Error("Password does not match");
	}

	return guide;
};

// Static method to validate Authentication Token
guideSchema.statics.validateToken = async function (token) {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	const guide = await Guide.findOne({ _id: decoded._id });
	if (!guide) {
		throw new Error("Invalid token");
	}

	return guide.toJSON();
};

// Custom method to generate token for authentication when user logs in or create account
guideSchema.methods.generateToken = async function () {
	const guide = this;

	const token = jwt.sign({ _id: guide._id.toString() }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES,
	});

	guide.token = token;
	await guide.save();

	return token;
};

guideSchema.methods.createPasswordResetToken = async function () {
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
// guideSchema.methods.comparePassword = async function (plainPw, userPw) {
// 	return await bcrypt.compare(plainPw, userPw);
// };


// //* pre-save HASH hook --> works on create-save-update
// guideSchema.pre('save', async function (next) {
// 	const user = this;

// 	if (user.isModified('password') || user.isNew) {
// 		user.password = await bcrypt.hash(user.password, 10);
// 		user.passwordChangedAt = Date.now() - 1000;
// 	}
// 	next();
// });

// =================== This code block is to replace bcrypt that does not supported in shared hosting
// Comparing password with hashed one

guideSchema.methods.comparePassword = async function (plainPw, userPw) {
	if (hashPassword(plainPw) === userPw) {
		return true;
	}
	return false;
};


const hashPassword = password => {
	return crypto.createHash('sha256').update(password).digest('hex')
}
//* pre-save HASH hook --> works on create-save-update
guideSchema.pre('save', async function (next) {
	const guide = this;
	
	if (guide.isModified('password') || guide.isNew) {
		guide.password = await hashPassword(guide.password);
		guide.passwordChangedAt = Date.now() - 1000;
	}
	next();
});

// ==============================================

const Guide = new mongoose.model('Guides', guideSchema)
module.exports = Guide;