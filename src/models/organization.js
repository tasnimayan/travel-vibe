const mongoose = require('mongoose')
const { isEmail } = require('validator');
// const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')


// User password update does not triggers pre method

// Creating User Schema
const organizationSchema = new mongoose.Schema(
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

		tours: [
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
			enum: ['user', 'guide', 'admin', 'org', 'hotel'],
			default: 'user',
		},

		active: {
			type: Boolean,
			default: true,
		},

		passwordChangedAt: Date,
		resetPasswordToken: String,
		resetPasswordExpires: Date,
	},

	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }  }
);



// Method to hide unnecessary fields to 'user' role 
organizationSchema.methods.toJSON = function () {
	const org = this.toObject();

	if (org.role === 'org' || org.role === 'org') {
		delete org.password;
		delete org.passwordChangedAt;
		delete org.resetPasswordToken;
		delete org.resetPasswordExpires;
		delete org.createdAt;
		delete org.updatedAt;
		delete org.active;
		delete org.token;
		delete org.userReviews;
		delete org.userTours;
		delete org.__v;
		delete org.id;
	}

	return org;
};


// Static methods that can be called on Model instead of instance of model
organizationSchema.statics.loginUser = async (email, password) => {

	const org = await Organization.findOne({ email });

	if (!org || org.active === false) {
		throw new Error('Account is not active');
	}

	const match = await org.comparePassword(password, org.password);

	if (!match) {
		throw new Error("Password does not match");
	}

	return user;
};

// Static method to validate Authentication Token
organizationSchema.statics.validateToken = async function (token) {
	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	const org = await Organization.findOne({ _id: decoded._id });
	if (!org) {
		throw new Error("Invalid token");
	}

	return org.toJSON();
};

// Custom method to generate token for authentication when user logs in or create account
organizationSchema.methods.generateToken = async function () {
	const org = this;

	const token = jwt.sign({ _id: org._id.toString() }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES,
	});

	org.token = token;
	await org.save();

	return token;
};

organizationSchema.methods.createPasswordResetToken = async function () {
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

organizationSchema.methods.comparePassword = async function (plainPw, userPw) {
	if (hashPassword(plainPw) === userPw) {
		return true;
	}
	return false;
};


const hashPassword = password => {
	return crypto.createHash('sha256').update(password).digest('hex')
}
//* pre-save HASH hook --> works on create-save-update
organizationSchema.pre('save', async function (next) {
	const org = this;
	
	if (org.isModified('password') || org.isNew) {
		org.password = await hashPassword(org.password);
		org.passwordChangedAt = Date.now() - 1000;
	}
	next();
});

// ==============================================

const Organization = mongoose.model('Organization', organizationSchema)
module.exports = Organization;