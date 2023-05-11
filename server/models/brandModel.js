import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const brandSchema= new mongoose.Schema(
  {
    brandName: { type: String },
    brandDetails: {},
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reward" }],
    additionalInfo: {},
    ratings: { type: Number },
    reviews: [reviewSchema],

  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
