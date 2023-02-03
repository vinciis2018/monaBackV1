import mongoose from "mongoose";

const pinSchema = new mongoose.Schema(
  {
    category: { type: String, default: "screen" || "shop" },
    screenPin: { type: Boolean, default: false },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    shopPin: { type: Boolean, default: false },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    image: { type: String },
    activeGame: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lat: { type: Number },
    lng: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Pin = mongoose.model("Pin", pinSchema);

export default Pin;
