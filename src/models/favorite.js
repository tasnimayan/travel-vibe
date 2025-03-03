import mongoose, { Schema } from "mongoose";

const FavoriteTourSchema = new Schema<IFavorite>(
  {
    user : { type: Schema.Types.ObjectId, ref: "UserProfile", required: true },
    tour: { 
      type: Schema.Types.ObjectId,
      ref:"Tour",
      required: true 
    },
  },
  { timestamps: true }
);

FavoriteTourSchema.index({ user: 1, tour: 1 }, { unique: true });

const FavoriteTour = mongoose.model("Favorite", FavoriteTourSchema);
module.exports = FavoriteTour;