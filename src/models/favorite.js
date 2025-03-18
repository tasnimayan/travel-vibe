const mongoose = require("mongoose");

const FavoriteTourSchema = new mongoose.Schema(
  {
    user : { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true },
    tour: { 
      type: mongoose.Schema.Types.ObjectId,
      ref:"Tour",
      required: true 
    },
  },
  { timestamps: true }
);

FavoriteTourSchema.index({ user: 1, tour: 1 }, { unique: true });

const FavoriteTour = mongoose.model("Favorite", FavoriteTourSchema);
module.exports = FavoriteTour;