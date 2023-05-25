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

const couponRewardSchema = new mongoose.Schema({
  redeemer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  couponType: { type: String }, // discount / free
  couponItem: { type: String },
  redeemFrequency: { type: Number },
  couponInfo: {
    // discount
    type: { type: String }, // percent / rupee
    value: { type: String },

    // free
    freeItemQuantity: { type: Number },
  },
  validity: {
    to: { type: String },
    from: { type: String },
  },
  description: { type: String },
  additionalInfo: {},
  graphicInfo: {
    mediaFiles: [{ type: String }],
    graphicText: [{ type: String }],
    fontStyle: [{ type: String }],
    backgroundColors: [{ type: String }],
    description: { type: String },
    additionalInfo: {},
  },
});

const cardRewardSchema = new mongoose.Schema({
  redeemer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cardType: { type: String }, // loyalty
  cardPoints: { type: Number }, // loyalty points
  // cardMilestones: [{ type: Number }],
  cardMilestonesReward: [
    {
      couponReward: couponRewardSchema,
      milestonePoint: { type: String }, // it should to number
    },
  ],
  validity: {
    to: { type: String },
    from: { type: String },
  },
  description: { type: String },
  additionalInfo: {},
  graphicInfo: {
    mediaFiles: [{ type: String }],
    graphicText: [{ type: String }],
    fontStyle: [{ type: String }],
    backgroundColors: [{ type: String }],
    description: { type: String },
    additionalInfo: {},
  },
});

// Reward Offer schema
const rewardOfferSchema = new mongoose.Schema(
  {
    offerName: { type: String },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    brandName: { type: String },
    offerCreator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // nfts: [{ type: String, default: ""}],
    quantity: { type: Number },
    rewardOfferType: {
      type: { type: String, default: "" }, // card / coupon
      cardReward: cardRewardSchema,
      couponReward: couponRewardSchema,
      additonalInfo: {},
    },
    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
    rewardOfferPartners: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    ratings: { type: Number },
    reviews: [reviewSchema],
    createdOn: { type: String, default: Date.now() },
    additionalInfo: {},
    offerInfo: {
      mediaFiles: [{ type: String }],
      graphicText: [{ type: String }],
      fontStyle: [{ type: String }],
      backgroundColors: [{ type: String }],
      description: { type: String },
      additionalInfo: {},
    },
  },
  {
    timestamps: true,
  }
);

const RewardOffer = mongoose.model("RewardOffer", rewardOfferSchema);

export default RewardOffer;
