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

const allySchema= new mongoose.Schema(
  {
    allyName: { type: String },
    allyDetails: {},
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

const Ally = mongoose.model("Ally", allySchema);

export default Ally;
