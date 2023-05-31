import mongoose from "mongoose";

const pleaSchema = new mongoose.Schema(
  {
    video: { type: String },
    campaignForMultipleScreen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampaignForMultipleScreen",
    },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, //from
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // to
    pleaType: {
      type: String,
      required: true,
      default: "SCREEN_ALLY_PLEA",
      enum: ["SCREEN_ALLY_PLEA", "CAMPAIGN_ALLY_PLEA", "COUPON_REDEEM_PLEA"],
    },
    couponCode: { type: String },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" } || null,
    content: { type: String },
    status: { type: Boolean, default: false },
    reject: { type: Boolean, default: false },
    blackList: { type: Boolean, default: false },
    remarks: [],
  },
  {
    timestamps: true,
  }
);

const Plea = mongoose.model("Plea", pleaSchema);

export default Plea;
