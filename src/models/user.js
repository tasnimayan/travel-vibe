/**
 * This User schema is for all kind of user login info
 */
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const { hashPassword, comparePassword } = require('./src/utils/auth');

const userSchema = new mongoose.Schema({
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
			// required: true,
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
    oauthProvider: {
      type: String, // e.g., 'google', 'facebook'
    },
    oauthId: {
      type: String,
    },
    role: {
      type: String,
      enum: ['organization', 'guide', 'user', 'hotel'],
      required: true,
    },
    passwordResetToken: String,
    resetTokenCreatedAt: Date,
    lastPasswordChangedAt: Date,
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
    rememberedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// email password login validator
userSchema.statics.login = async function(email, password) {
  try {
    const user = await this.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      throw new Error('Invalid login credentials');
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new Error('Account is locked. Please try again later');
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    
    if (!isMatch) {
      user.loginAttempts += 1;
      
      // Check if we need to lock the account
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      
      await user.save();
      throw new Error('Invalid login credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts !== 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// =================== This code block is to replace bcrypt that does not supported in shared hosting
// Comparing password with hashed one

userSchema.methods.comparePassword = async function (plainPw, userPw) {
	if (hashPassword(plainPw) === userPw) {
		return true;
	}
	return false;
};







// pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  user.updatedAt = Date.now();
  
  // Only hash the password if it has been modified
  if (!user.isModified('password')) {
    return next();
  }

  try {
    user.password = await hashPassword(user.password);
    user.lastPasswordChangedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
