/**
 * This User schema is for all kind of user login info
 */
const mongoose = require("mongoose");
const { isEmail } = require("validator");
const { hashPassword, comparePassword } = require("../utils/auth");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: [true, "User already exists with this email"],
      trim: true,
      lowercase: true,
      validate(value) {
        if (!isEmail(value)) {
          throw new Error("Invalid email format!");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      // required: true,
      minlength: 8,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot contain -password-");
        }
        if (value.toLowerCase() === "12345678") {
          throw new Error("Password is very weak");
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
      enum: ["organization", "guide", "user", "hotel", "admin"],
      required: true,
    },
    passwordResetToken: String,
    resetTokenExpiresAt: Date,
    lastPasswordChangedAt: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    otp: {
      type: Number,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
    },
    otpRequestCount: {
      type: Number,
      default: 0,
    },
    otpRequestCountResetAt: {
      type: Date,
      default: Date.now,
    },
    rememberedAt: {
      type: Date,
      default: null,
    },
    isVerified: Boolean,
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Method to hide unnecessary fields to 'user' role
userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.passwordResetToken;
  delete user.resetTokenExpiresAt;
  delete user.lastPasswordChangedAt;
  delete user.otp;
  delete user.otpExpiresAt;
  delete user.otpRequestCount;
  delete user.otpRequestCountResetAt;
  delete user.rememberedAt;
  delete user.loginAttempts;
  delete user.createdAt;
  delete user.updatedAt;

  return user;
};

// email password login validator
userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new Error("Invalid login credentials");
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60); // Convert to minutes
      throw new Error(`Account is locked. Please try again in ${remainingTime} minutes`);
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
      throw new Error("Invalid login credentials");
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

// Static method to validate Auth JWT Token
userSchema.statics.validateToken = async function (token) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET environment is not provided.");

    const decoded = jwt.verify(token, jwtSecret);

    const user = await this.findOne({
      _id: decoded._id,
      email: decoded.email,
    }).select("-password -passwordResetToken -resetTokenExpiresAt -otp");

    if (!user) {
      throw new Error("User not found or token invalid");
    }

    // Check if token issued before password change
    if (user.lastPasswordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000;
      if (tokenIssuedAt < user.lastPasswordChangedAt.getTime()) {
        throw new Error("Token invalid due to password change");
      }
    }

    // Check if user is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new Error("Account is locked");
    }

    return user.toJSON();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw error;
  }
};

// Custom method to generate token for authentication when user logs in or create account
userSchema.methods.generateToken = async function () {
  const user = this;

  if (!user._id || !user.email || !user.role) {
    throw new Error("Required user properties missing for token generation");
  }

  const tokenPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  };
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET environment is not provided.");

  const token = jwt.sign(tokenPayload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  return token;
};

// method for creating password reset token to verify
userSchema.statics.createPasswordResetToken = async function (email) {
  const user = await this.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new Error("No user found with this email address");
  }

  // Generate random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token before saving to database
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Token expires in 1 hour
  user.resetTokenExpiresAt = Date.now() + 1000 * 60 * 60;

  await user.save();

  return resetToken;
};

// Static method to verify reset token and update password
userSchema.statics.resetPassword = async function (resetToken, newPassword) {
  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await this.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpiresAt: { $lt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  // Update password and clear reset token fields
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.resetTokenCreatedAt = undefined;

  await user.save();

  return user;
};

// pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  user.updatedAt = Date.now();

  // Only hash the password if it has been modified
  if (!user.isModified("password")) {
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

const User = mongoose.model("User", userSchema);
module.exports = User;
