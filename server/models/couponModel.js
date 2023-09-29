import mongoose from "mongoose";
import { COUPON_STATUS_ACTIVE } from "../Constant/couponStatusConstant.js";

export const couponRewardSchema = new mongoose.Schema(
  {
    redeemer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    redeemedFrequency: { type: Number, default: 0 }, // for each user, each user how many times redeemed this coupon
    additionalInfo: {},
    status: { type: String, default: "CLAIMED" },
    email: { type: String },
    claimedLocation: { type: String },
    claimedScreen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
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

const couponSchema = new mongoose.Schema(
  {
    offerName: { type: String },
    offerDetails: { type: String },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    brandLogo: { type: String },
    brandName: { type: String },
    offerCreator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // nfts: [{ type: String, default: ""}],
    quantity: { type: Number },
    couponCode: { type: String },
    status: { type: String, default: COUPON_STATUS_ACTIVE },

    couponRewardInfo: {
      couponType: { type: String }, // % discount , discount amount , buy x get y , freebie
      minimumOrderCondition: { type: String },
      minimumOrderValue: { type: Number },
      minimumOrderQuantity: { type: Number },
      discountPersentage: { type: Number },
      discountAmount: { type: Number },
      buyItems: [{ type: String }], // buy x get y
      freeItems: [{ type: String }], // buy x gey y
      freebieItemsName: [{ type: String }], //freebie
      loyaltyPoints: { type: Number },
      redeemFrequency: { type: Number },
      validity: {
        to: { type: String },
        from: { type: String },
      },
      showCouponToCustomer: { type: Boolean, default: true },
      validForOnLinePayment: { type: Boolean, default: true },
      validForNewCostomer: { type: Boolean, default: true },
      autoApplyCoupon: { type: Boolean, default: true },
      images: [{ type: String }],
    },

    rewardCoupons: [couponRewardSchema],
    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
    allCampaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],

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

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
