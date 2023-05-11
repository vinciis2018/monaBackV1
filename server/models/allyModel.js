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
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
    ratings: { type: Number },
    reviews: [reviewSchema],

  },
  {
    timestamps: true,
  }
);

const Ally = mongoose.model("Ally", allySchema);

export default Ally;
