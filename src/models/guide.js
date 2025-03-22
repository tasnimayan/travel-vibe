const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 99,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },

    // Location and Languages
    country: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    servingLocations: [
      {
        type: String,
        required: true,
      },
    ],
    languages: [
      {
        type: String,
        required: true,
      },
    ],

    // Professional Details
    bio: {
      type: String,
      trim: true,
    },
    expertise: [
      {
        type: String,
        required: true,
      },
    ],
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
    availability: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        },
        startTime: String,
        endTime: String,
        timezone: {
          type: String,
          default: "UTC",
        },
      },
    ],

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    totalServedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

guideSchema.index({ city: 1 });
guideSchema.index({ country: 1 });
guideSchema.index({ email: 1 });

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

const Guide = new mongoose.model("Guides", guideSchema);
module.exports = Guide;
