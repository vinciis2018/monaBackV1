import mongoose from "mongoose";

export const couponRewardSchema = new mongoose.Schema(
  {
    redeemer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    couponCode: { type: String, required: true }, //unique coupon code assign to each coupon
    redeemedFrequency: { type: Number, default: 0 }, // for each user, each user how many times redeemed this coupon
    additionalInfo: {},
  },
  {
    timestamps: true,
  }
);
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

const couponRewardOfferSchema = new mongoose.Schema(
  {
    offerName: { type: String },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    brandName: { type: String },
    offerCreator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // nfts: [{ type: String, default: ""}],
    quantity: { type: Number },
    couponRewardInfo: {
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
    },
    rewardCoupons: [couponRewardSchema],
    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
    rewardOfferPartners: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    ratings: { type: Number },
    reviews: [reviewSchema],
    createdOn: { type: String, default: Date.now() },
    additionalInfo: {},
    graphicInfo: {
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

const CouponRewardOffer = mongoose.model(
  "CouponRewardOffer",
  couponRewardOfferSchema
);

export default CouponRewardOffer;
