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

const masterSchema= new mongoose.Schema(
  {
    masterName: { type: String },
    masterDetails: {},
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

const Master = mongoose.model("Master", masterSchema);

export default Master;
