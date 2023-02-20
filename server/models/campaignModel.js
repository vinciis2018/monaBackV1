import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    calendar: {
      startDate: { type: Date },
      endDate: { type: Date },
      startTime: { type: Date },
      endTime: { Type: Date },
    },
    ScreenOwner: {
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
    rentPerSlot: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    isSlotBooked: { type: Boolean, default: false },
    paidForSlot: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model("slotBooking", campaignSchema);

export default Campaign;
