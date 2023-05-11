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

const couponRewardSchema = new mongoose.Schema(
  {
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
    }
  }
);

const cardRewardSchema = new mongoose.Schema(
  {
    redeemer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cardType: { type: String }, // loyalty
    cardPoints: { type: Number }, // loyalty points
    cardMilestones: [{ type: Number }],
    cardMilestonesReward: [{
      couponReward: couponRewardSchema,
      milestonePoint: { type: String }, 
    }],
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
    }
  }
);

// Reward Program
const rewardProgramSchema = new mongoose.Schema(
  {
    programName: { type: String },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    brandName: { type: String },
    programCreator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // nfts: [{ type: String, default: ""}],
    quantity: { type: Number },
    rewardProgramType: {
      type: { type: String, default: "" }, // card / coupon
      cardReward: cardRewardSchema,
      couponReward: couponRewardSchema,
      additonalInfo: {},
    },
    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
    rewardProgramPartners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ratings: { type: Number },
    reviews: [reviewSchema],
    createdOn:  { type: String, default: Date.now() },
    additionalInfo: {},
    programInfo: {
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

const RewardProgram = mongoose.model("RewardProgram", rewardProgramSchema);

export default RewardProgram;
