import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    media: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
    video: { type: String, required: true },
    cid: { type: String, required: true },
    thumbnail: { type: String, required: true },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    campaignName: { type: String, required: true, default: "campaign name" },
    startDate: { type: Date },
    endDate: { type: Date },
    startTime: { type: Date },
    endTime: { Type: Date },
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
    isDefaultCampaign: { type: Boolean, default: false }, // screen.master === campaign.ally
    paidForSlot: { type: Boolean, default: false },
    isPause: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    screenAddress: { type: String }, //v
    districtCity: { type: String, required: true }, //v
    stateUT: { type: String, required: true }, //v
    country: { type: String, required: true }, //v
    status: { type: String, required: true, default: "Pending" },
    coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],

    // isPrivate: { type: Boolean, default: false },// for brands who want to keep their campaign private
    // isMain: { type: Boolean, default: false },// for one main content
    /**
     * Status will change accorging to this condition
     * paidForSlot === false -> Pending
     * remainingSlots > 0 && paidForSlot  -> Running(Active)
     * isPause === true => Pause
     * remainingSlots == 0 && paidForSlot => Completed
     * isDeleted => Deleted
     *
     *
     */
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
