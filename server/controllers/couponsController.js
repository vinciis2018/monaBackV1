import Brand from "../models/brandModel.js";
import Campaign from "../models/campaignModel.js";
import Coupon from "../models/couponModel.js";

export const createNewCoupon = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.brandId);

    if (!brand) return req.status(404).send("No brand found");

    const newCoupon = new Coupon({
      offerName: req.body.offerName,
      offerDetails: req.body.offerDetails,
      brand: brand?._id,
      brandName: brand.brandName,
      offerCreator: req.params.userId,
      // nfts: [{ type: String, default: ""}],
      brandLogo: brand?.brandDetails?.logo,
      quantity: req.body.quantity,
      couponCode: req.body.couponCode,
      campaigns: req.body.campaigns || [],

      couponRewardInfo: {
        couponType: req.body?.couponType, // % discount , discount amount , buy x get y , freebie
        minimumOrderCondition: req.body?.minimumOrderCondition,
        minimumOrderValue: req.body?.minimumOrderValue,
        minimumOrderQuantity: req.body?.minimumOrderQuantity,
        discountPersentage: req.body?.discountPersentage,
        discountAmount: req.body?.discountAmount,
        buyItems: req.body?.buyItems, // buy x get y
        freeItems: req.body?.freeItems, // buy x gey y
        freebieItemsName: req.body?.freebieItemsName, //freebie
        loyaltyPoints: req.body?.loyaltyPoints,
        redeemFrequency: req.body?.redeemFrequency,
        validity: {
          to: req.body?.endDateAndTime,
          from: req.body?.startDateAndTime,
        },

        showCouponToCustomer: req.body.showCouponToCustomer,
        validForOnLinePayment: req.body.validForOnLinePayment,
        validForNewCostomer: req.body.validForNewCostomer,
        autoApplyCoupon: req.body.autoApplyCoupon,
      },

      ratings: 0,
      reviews: [],
      createdOn: Date.now(),
    });

    const coupon = await newCoupon.save();
    for (let id of coupon?.campaigns) {
      const campaign = await Campaign.findById(id);
      if (!campaign?.coupons.includes(coupon._id)) {
        campaign.coupons.push(coupon._id);
      }
      const updatedcampaign = await campaign.save();
      // console.log("updatedcampaign  : ", updatedcampaign);
    }

    return res.status(200).send(coupon);
  } catch (error) {
    console.log("error : ", error);
    return res.status(500).send({
      message: `Coupon Reward controller error at createNewCoupon ${error.message}`,
    });
  }
};

export async function getCouponListForBrand(req, res) {
  try {
    const brand = await Brand.findById(req.params.brandId);
    if (!brand) return req.status(404).send("No brand found");
    const couponList = await Coupon.find({ brand: brand?._id });
    return res.status(200).send(couponList);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at getCouponListForBrand ${error.message}`,
    });
  }
}

export async function updateCoupon(req, res) {
  try {
    console.log("edit coupon details called! ", req.body);
    const coupon = await Coupon.findById(req.params.couponId);

    coupon.offerName = req.body.offerName || coupon.offerName;
    coupon.offerDetails = req.body.offerDetails || coupon.offerDetails;

    coupon.quantity = req.body.quantity || coupon.quantity;
    coupon.couponCode = req.body.couponCode || coupon.couponCode;
    coupon.campaigns = req.body.campaigns || req.body.campaign;

    // coupon.couponRewardInfo.couponType = req.body?.couponType; // % discount ; discount amount ; buy x get y ; freebie
    coupon.couponRewardInfo.minimumOrderCondition =
      req.body?.minimumOrderCondition ||
      coupon.couponRewardInfo.minimumOrderCondition;
    coupon.couponRewardInfo.minimumOrderValue =
      req.body?.minimumOrderValue || coupon.couponRewardInfo.minimumOrderValue;
    coupon.couponRewardInfo.minimumOrderQuantity =
      req.body?.minimumOrderQuantity ||
      coupon.couponRewardInfo.minimumOrderQuantity;
    coupon.couponRewardInfo.discountPersentage =
      req.body?.discountPersentage ||
      coupon.couponRewardInfo.discountPersentage;
    coupon.couponRewardInfo.discountAmount =
      req.body?.discountAmount || coupon.couponRewardInfo.discountAmount;
    coupon.couponRewardInfo.buyItems =
      req.body?.buyItems | coupon.couponRewardInfo.buyItems; // buy x get y
    coupon.couponRewardInfo.freeItems =
      req.body?.freeItems || coupon.couponRewardInfo.freeItems; // buy x gey y
    coupon.couponRewardInfo.freebieItemsName =
      req.body?.freebieItemsName || coupon.couponRewardInfo.freebieItemsName; //freebie
    coupon.couponRewardInfo.loyaltyPoints =
      req.body?.loyaltyPoints || coupon.couponRewardInfo.loyaltyPoints;
    coupon.couponRewardInfo.redeemFrequency =
      req.body?.redeemFrequency || coupon.couponRewardInfo.redeemFrequency;
    coupon.couponRewardInfo.validity.to =
      req.body?.endDateAndTime || coupon.couponRewardInfo.validity.to;
    coupon.couponRewardInfo.validity.from =
      req.body?.startDateAndTime || coupon.couponRewardInfo.validity.from;

    coupon.couponRewardInfo.showCouponToCustomer =
      req.body.showCouponToCustomer ||
      coupon.couponRewardInfo.showCouponToCustomer;
    coupon.couponRewardInfo.validForOnLinePayment =
      req.body.validForOnLinePayment ||
      coupon.couponRewardInfo.validForOnLinePayment;
    coupon.couponRewardInfo.validForNewCostomer =
      req.body.validForNewCostomer ||
      coupon.couponRewardInfo.validForNewCostomer;
    coupon.couponRewardInfo.autoApplyCoupon =
      req.body.autoApplyCoupon || coupon.couponRewardInfo.autoApplyCoupon;

    const updatedCoupon = await coupon.save();
    console.log("coupon updated successfullt!");

    for (let id of updatedCoupon?.campaigns) {
      const campaign = await Campaign.findById(id);
      if (!campaign?.coupons.includes(updatedCoupon._id)) {
        campaign.coupons.push(updatedCoupon._id);
      }
      const updatedcampaign = await campaign.save();
      // console.log("updatedcampaign  : ", updatedcampaign);
    }

    return res.status(200).send(updatedCoupon);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at editCouponDetails ${error.message}`,
    });
  }
}

export const getAllActiveCouponList = async (req, res) => {
  try {
    // const today = new Date();
    // console.log("today : ", today);
    const coupons = await Coupon.find({});
    // const coupons = await Coupon.find({
    //   $or: [
    //     { "couponRewardInfo.validity.to": { $gte: today } },
    //     { "couponRewardInfo.validity.to": { $eq: null } },
    //   ],
    //   "couponRewardInfo.validity.from": { $lte: today },
    // });
    console.log("coupons: ", coupons?.length);
    return res.status(200).send(coupons);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Coupon Reward controller error at getAllActiveCouponList ${error.message}`,
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).send("Coupon not found!");
    }
    if (coupon?.campaigns?.length > 0) {
      for (let campaignId of coupon?.campaigns) {
        const campaign = await Campaign.findById(campaignId);
        // console.log("before campaigns : ", campaign?.coupons);
        campaign.coupons = campaign.coupons.filter(
          (id) => id !== campaign?._id
        );
        const updatedCampaign = await campaign.save();
        // console.log("updated campaigns : ", updatedCampaign?.coupons);
      }
    }
    const deletedCoupon = await coupon.delete();
    // console.log("delted coupon : ", deletedCoupon);
    return res.status(200).send(deletedCoupon);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Coupon Reward controller error at getAllActiveCouponList ${error.message}`,
    });
  }
};
