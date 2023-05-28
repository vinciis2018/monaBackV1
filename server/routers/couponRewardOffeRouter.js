import express from "express";
import {
  AddCampaignToCoupons,
  addRedmeerToCoupon,
  createNewCouponRewardOffer,
  editCouponRewardOffer,
  getCouponRewadOfferDetailsForBrand,
  getCouponRewardOfferListForBrand,
  getRewardOfferPartnerList,
} from "../controllers/couponRewardOfferController.js";
import { isAuth } from "../utils/authUtils.js";
const couponRewardOfferRouter = express.Router();

// post
couponRewardOfferRouter.post("/create", isAuth, createNewCouponRewardOffer);

// put
couponRewardOfferRouter.put("/addCampaigsOnCoupon", AddCampaignToCoupons);
couponRewardOfferRouter.put(
  "/addRedmeerToCoupon/:couponId/:userId",
  addRedmeerToCoupon
);
couponRewardOfferRouter.put("/couponReward/:id", isAuth, editCouponRewardOffer);

// get
couponRewardOfferRouter.get(
  "/couponRewardOfferListForBrand/:id",
  getCouponRewardOfferListForBrand
);
couponRewardOfferRouter.get(
  "/couponRewardOfferDetailForBrand/:id",
  getCouponRewadOfferDetailsForBrand
);
couponRewardOfferRouter.get(
  "/rewardOfferPartnerList/:couponId",
  getRewardOfferPartnerList
);

export default couponRewardOfferRouter;
