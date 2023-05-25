import mongoose from "mongoose";

const couponRewardSchema = new mongoose.Schema({
  redeemer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  couponCode: { type: String, required: true }, //unique coupon code assign to each coupon
  hasRedeem: { type: Boolean, default: false },
  additionalInfo: {},
});
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

const cardRewardSchema = new mongoose.Schema({
  redeemer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cardPoints: { type: Number }, // loyalty points
  cardNumber: { type: Number, required: true }, // unique card no.

  description: { type: String },
  additionalInfo: {},
});

const cardRewardOfferSchema = new mongoose.Schema(
  {
    offerName: { type: String },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    brandName: { type: String },
    offerCreator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // nfts: [{ type: String, default: ""}],
    quantity: { type: Number },
    cardType: { type: String }, // loyalty

    validity: {
      to: { type: String },
      from: { type: String },
    },
    rewardCards: [cardRewardSchema],

    cardMilestonesRewards: [
      {
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
        graphicInfo: {
          mediaFiles: [{ type: String }],
          graphicText: [{ type: String }],
          fontStyle: [{ type: String }],
          backgroundColors: [{ type: String }],
          description: { type: String },
          additionalInfo: {},
        },
        couponReward: [couponRewardSchema],
        milestonePoint: { type: String }, // it should to number
      },
    ],
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

const CardRewardOffer = mongoose.model(
  "CardRewardOffer",
  cardRewardOfferSchema
);

export default CardRewardOffer;
