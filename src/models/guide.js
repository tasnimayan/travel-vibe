const mongoose = require('mongoose');
const { isEmail } = require('validator');
const { Schema } = mongoose;
const { hashPassword, comparePassword } = require('./src/utils/auth');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 1 * 60 * 60 * 1000; // 1 hour in milliseconds


const guideSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength:2,
    maxLength: 99
  },
  profileImage: {
    type: String,
    default: 'default-profile.jpg',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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
    minlength: 8,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain -password-');
      }
      if(value.toLowerCase() === '12345678') {
        throw new Error('Password is very weak')
      }
    },
  },
  phone: {
    type: String,
    trim: true,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },

  // Location and Languages
	country: { type: String, required: true },
  city : { type: String, required: true },
	address: { type: String, required: true },
  servingLocations: [{
    type: String,
    required: true,
  }],
  languages: [{
    type: String,
    required: true,
  }],

  // Professional Details
  bio: {
    type: String,
    trim: true,
  },
  expertise: [{
    type: String,
    required: true,
  }],
  pricePerHour: {
    type: Number,
    required: true,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },

  // Availability
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: String,
    endTime: String,
    timezone: {
      type: String,
      default: 'UTC'
    },
  }],

  // Verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDocuments: [{
    type: String,
  }],
  isActive: { 
    type: Boolean, 
    default: false
  },

// Password and Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastPasswordChange: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  totalServedCount: {
    type: Number,
    default: 0,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

guideSchema.index({city: 1})
guideSchema.index({country: 1})
guideSchema.index({email: 1})

// Method to hide unnecessary fields to 'user' role 
guideSchema.methods.toJSON = function () {
	const guide = this.toObject();

  delete guide.password;
  delete guide.verificationDocuments;
  delete guide.createdAt;
  delete guide.updatedAt;
  delete guide.__v;

	return guide;
};

// email password login validator
guideSchema.statics.login = async function(email, password) {
  try {
    const guide = await this.findOne({ email: email.toLowerCase() });
    
    if (!guide) {
      throw new Error('Invalid login credentials');
    }

    if (guide.lockUntil && guide.lockUntil > Date.now()) {
      throw new Error('Account is locked. Please try again later');
    }

    // Verify password
    const isMatch = await comparePassword(password, guide.password);
    
    if (!isMatch) {
      guide.loginAttempts += 1;
      
      // Check if we need to lock the account
      if (guide.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        guide.lockUntil = Date.now() + LOCK_TIME;
      }
      
      await guide.save();
      throw new Error('Invalid login credentials');
    }

    // Reset login attempts on successful login
    if (guide.loginAttempts !== 0 || guide.lockUntil) {
      guide.loginAttempts = 0;
      guide.lockUntil = undefined;
      await guide.save();
    }
    
    // Update last login timestamp
    guide.lastLogin = Date.now();
    await guide.save();

    return guide;
  } catch (error) {
    throw error;
  }
};



// previous Code

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

// pre-save hook to hash password before saving
guideSchema.pre('save', async function(next) {
  const guide = this;
  guide.updatedAt = Date.now();
  
  // Only hash the password if it has been modified
  if (!guide.isModified('password')) {
    return next();
  }

  try {
    guide.password = await hashPassword(guide.password);
    guide.lastPasswordChange = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

const Guide = new mongoose.model('Guides', guideSchema)
module.exports = Guide;