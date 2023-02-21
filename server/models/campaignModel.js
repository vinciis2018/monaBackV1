import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    media: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
    mediaURL: { type: String },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    calendar: {
      startDate: { type: Date },
      endDate: { type: Date },
      startTime: { type: Date },
      endTime: { Type: Date },
    },
    master: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ally: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // campaign creator
    allyWalletAddress: { type: String },
    vault: { type: Number, default: 0 },
    totalSlotBooked: { type: Number, default: 0 },
    remainingSlots: { type: Number, default: 0 },
    rentPerSlot: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    isSlotBooked: { type: Boolean, default: false },
    paidForSlot: { type: Boolean, default: false },
    screenAddress: { type: String }, //v
    districtCity: { type: String, required: true }, //v
    stateUT: { type: String, required: true }, //v
    country: { type: String, required: true }, //v
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
