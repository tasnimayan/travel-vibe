// updated:
const mongoose = require("mongoose");
const { packageSchema } = require("./tourPackage");
const COUNTRY_CODES = require("../lib/countryCode");
const Policy = require("./policy");
const Organization = require("./organization");

const tourSchema = mongoose.Schema(
  {
    // _id - will be auto generated
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    bookingDeposit: { type: Number, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    currency: { type: String, enum: ["BDT", "USD", "EUR", "INR", "GBP"], default: "USD" },
    startDate: { type: Date },
    endDate: { type: Date },
    duration: { type: String },
    images: [String],
    destination: { type: String },
    highlightedPlaces: [{ type: String }],
    maxGroupSize: { type: Number, min: 1 },
    pickupPoint: [String],
    departureTime: { type: Date },
    rating: { type: Number, default: 0, max: 5, set: (val) => ((val * 10) / 10).toFixed(2) },
    ratingQuantity: { type: Number },
    packages: [packageSchema],
    amenities: [{ type: String }],
    itinerary: [
      {
        title: { type: String, required: true },
        activities: [
          {
            title: { type: String, required: true },
            description: { type: String, required: true },
          },
        ],
      },
    ],
    country: { type: String },
    countryCode: { type: String, uppercase: true, enum: Object.keys(COUNTRY_CODES), required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "ongoing" },
    isActive: { type: Boolean, default: true },

    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourCategory",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ startDate: 1, country: 1, category: 1 });

// Calculate finalPrice before providing the data to user
tourSchema.virtual("finalPrice").get(function () {
  if (this.discountAmount > 0) return this.price - this.discountAmount;
  if (this.discountPercentage > 0) return Math.round(this.price * (1 - this.discountPercentage / 10000) * 100) / 100;
  return this.price;
});

tourSchema.methods.isDiscounted = () => {
  return this.discountPercentage > 0;
};

tourSchema.virtual("createdByDetails", {
  ref: "Organization",
  localField: "createdBy",
  foreignField: "user",
  justOne: true,
  select: "name profileImage rating",
});

tourSchema.virtual("reviews", {
  ref: "TourReview",
  localField: "_id",
  foreignField: "tour",
});

tourSchema.virtual("policyDetails", {
  ref: "Policy",
  localField: "policy",
  foreignField: "_id",
  justOne: true,
});
tourSchema.virtual("favorites", {
  ref: "Favorite",
  localField: "_id",
  foreignField: "tour",
});

tourSchema.methods.toJSON = function () {
  const tour = this.toObject();
  delete tour.__v;

  return tour;
};

tourSchema.pre("save", async function (next) {
  if (this.countryCode) {
    this.country = COUNTRY_CODES[this.countryCode];
  }
  next();
});

tourSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  const update = this.getUpdate();
  if (update.countryCode) {
    update.country = COUNTRY_CODES[update.countryCode.toUpperCase()];
  }
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
