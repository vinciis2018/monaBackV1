import mongoose from "mongoose";
import {
  COUPON_STATUS_ACTIVE,
  COUPON_STATUS_DELETED,
  COUPON_STATUS_FULL,
} from "../Constant/couponStatusConstant.js";
import Brand from "../models/brandModel.js";
import Campaign from "../models/campaignModel.js";
import Coupon from "../models/couponModel.js";
import User from "../models/userModel.js";
import Screen from "../models/screenModel.js";
import { CAMPAIGN_STATUS_ACTIVE } from "../Constant/campaignStatusConstant.js";

export const createNewCoupon = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.brandId);
    // console.log(brand);
    if (!brand) {
      return req.status(404).send("No brand found");
    }
    // first find all camapign with same name and cid for comming coupon id:
    let campaignsId = [];

    for (let campaignId of req.body.campaigns) {
      const campaign = await Campaign.findById(campaignId);
      const campaigns = await Campaign.find({
        cid: campaign?.cid,
        campaignName: campaign.campaignName,
        status: CAMPAIGN_STATUS_ACTIVE,
      });
      const ids = campaigns.map((campaign) => campaign._id);
      campaignsId = [...campaignsId, ...ids];
    }

    // console.log("campaignsId : ", campaignsId);

    const newCoupon = new Coupon({
      offerName: req.body.offerName,
      offerDetails: req.body.offerDetails,
      brand: brand._id,
      brandName: brand.brandName,
      offerCreator: req.params.userId,
      // nfts: [{ type: String, default: ""}],
      brandLogo: brand.brandDetails.logo,
      quantity: req.body.quantity,
      couponCode: req.body.couponCode,
      campaigns: req.body.campaigns || [],

      couponRewardInfo: {
        couponType: req.body.couponType, // % discount , discount amount , buy x get y , freebie
        minimumOrderCondition: req.body.minimumOrderCondition,
        minimumOrderValue: req.body.minimumOrderValue,
        minimumOrderQuantity: req.body.minimumOrderQuantity,
        discountPersentage: req.body.discountPersentage,
        discountAmount: req.body.discountAmount,
        buyItems: req.body.buyItems, // buy x get y
        freeItems: req.body.freeItems, // buy x gey y
        freebieItemsName: req.body.freebieItemsName, //freebie
        loyaltyPoints: req.body.loyaltyPoints,
        redeemFrequency: req.body.redeemFrequency,
        validity: {
          to: req.body.endDateAndTime,
          from: req.body.startDateAndTime,
        },

        showCouponToCustomer: req.body.showCouponToCustomer,
        validForOnLinePayment: req.body.validForOnLinePayment,
        validForNewCostomer: req.body.validForNewCostomer,
        autoApplyCoupon: req.body.autoApplyCoupon,
        images: req.body.images || [],
      },

      ratings: 0,
      reviews: [],
      createdOn: Date.now(),
    });

    const coupon = await newCoupon.save();

    for (let id of campaignsId) {
      const campaign = await Campaign.findById(id);
      if (!campaign.coupons.includes(coupon._id)) {
        campaign.coupons.push(coupon._id);
      }
      const updatedcampaign = await campaign.save();
      // console.log("updatedcampaign  : ", updatedcampaign);
    }

    brand.offers.push(coupon);
    await brand.save();
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
    const couponList = await Coupon.find({ brand: brand._id });
    return res.status(200).send(couponList);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at getCouponListForBrand ${error.message}`,
    });
  }
}

export async function updateCoupon(req, res) {
  try {
    console.log("edit coupon details called! ");
    const coupon = await Coupon.findById(req.params.couponId);

    let campaignsId = [];

    for (let campaignId of req.body.campaigns) {
      const campaign = await Campaign.findById(campaignId);
      const campaigns = await Campaign.find({
        cid: campaign?.cid,
        campaignName: campaign.campaignName,
        status: CAMPAIGN_STATUS_ACTIVE,
      });
      const ids = campaigns.map((campaign) => campaign._id);
      campaignsId = [...campaignsId, ...ids];
    }

    coupon.offerName = req.body.offerName || coupon.offerName;
    coupon.offerDetails = req.body.offerDetails || coupon.offerDetails;

    coupon.quantity = req.body.quantity || coupon.quantity;
    coupon.couponCode = req.body.couponCode || coupon.couponCode;
    coupon.campaigns = req.body.campaigns || req.body.campaign;

    // coupon.couponRewardInfo.couponType = req.body.couponType; // % discount ; discount amount ; buy x get y ; freebie
    coupon.couponRewardInfo.minimumOrderCondition =
      req.body.minimumOrderCondition ||
      coupon.couponRewardInfo.minimumOrderCondition;
    coupon.couponRewardInfo.minimumOrderValue =
      req.body.minimumOrderValue || coupon.couponRewardInfo.minimumOrderValue;
    coupon.couponRewardInfo.minimumOrderQuantity =
      req.body.minimumOrderQuantity ||
      coupon.couponRewardInfo.minimumOrderQuantity;
    coupon.couponRewardInfo.discountPersentage =
      req.body.discountPersentage || coupon.couponRewardInfo.discountPersentage;
    coupon.couponRewardInfo.discountAmount =
      req.body.discountAmount || coupon.couponRewardInfo.discountAmount;
    coupon.couponRewardInfo.buyItems =
      req.body.buyItems | coupon.couponRewardInfo.buyItems; // buy x get y
    coupon.couponRewardInfo.freeItems =
      req.body.freeItems || coupon.couponRewardInfo.freeItems; // buy x gey y
    coupon.couponRewardInfo.freebieItemsName =
      req.body.freebieItemsName || coupon.couponRewardInfo.freebieItemsName; //freebie
    coupon.couponRewardInfo.loyaltyPoints =
      req.body.loyaltyPoints || coupon.couponRewardInfo.loyaltyPoints;
    coupon.couponRewardInfo.redeemFrequency =
      req.body.redeemFrequency || coupon.couponRewardInfo.redeemFrequency;
    coupon.couponRewardInfo.validity.to =
      req.body.endDateAndTime || coupon.couponRewardInfo.validity.to;
    coupon.couponRewardInfo.validity.from =
      req.body.startDateAndTime || coupon.couponRewardInfo.validity.from;

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
    coupon.couponRewardInfo.images =
      req.body.images || coupon.couponRewardInfo.images;

    const updatedCoupon = await coupon.save();

    for (let id of campaignsId) {
      const campaign = await Campaign.findById(id);
      if (!campaign.coupons.includes(updatedCoupon._id)) {
        campaign.coupons.push(updatedCoupon._id);
      }
      const updatedcampaign = await campaign.save();
      // console.log("updatedcampaign  : ", updatedcampaign);
    }
    console.log("coupon updated successfullt!");
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
    const coupons = await Coupon.find({ status: COUPON_STATUS_ACTIVE });
    // const coupons = await Coupon.find({
    //   $or: [
    //     { "couponRewardInfo.validity.to": { $gte: today } },
    //     { "couponRewardInfo.validity.to": { $eq: null } },
    //   ],
    //   "couponRewardInfo.validity.from": { $lte: today },
    // });
    console.log("coupons: ", coupons.length);
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
    const status = req.params.status;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).send("Coupon not found!");
    }

    // change for parmanent delete or not
    if (status === COUPON_STATUS_DELETED) {
      if (coupon.campaigns.length > 0) {
        let campaignsId = [];

        for (let campaignId of coupon.campaigns) {
          const campaign = await Campaign.findById(campaignId);
          const campaigns = await Campaign.find({
            cid: campaign?.cid,
            campaignName: campaign.campaignName,
          });
          const ids = campaigns.map((campaign) => campaign._id);
          campaignsId = [...campaignsId, ...ids];
        }

        for (let campaignId of campaignsId) {
          const campaign = await Campaign.findById(campaignId);
          // console.log("before campaigns : ", campaign.coupons);
          campaign.coupons = campaign.coupons.filter((id) => id != couponId);
          const updatedCampaign = await campaign.save();
          // console.log("updated campaigns : ", updatedCampaign.coupons);
        }
      }
      const brand = await Brand.findById(coupon.brand);
      brand.offers = brand.offers.filter((id) => id != coupon._id);
      await brand.save();

      const deletedCoupon = await coupon.delete();
      console.log("DELETD COUPON PERMANENTLY : ", deletedCoupon);
      return res.status(200).send(deletedCoupon);
    }
    coupon.status = status;
    await coupon.save();
    // console.log("delted coupon : ", deletedCoupon);
    return res.status(200).send(coupon);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: `Coupon Reward controller error at getAllActiveCouponList ${error.message}`,
    });
  }
};

export async function addRedeemerToCoupon(req, res) {
  try {
    // console.log("addRedeemerToCoupon called!");
    const couponId = req.params.id;
    const userId = req.params.userId;
    const screenId = req.params.screenId;

    console.log(req.params);
    const screen = await Screen.findById(screenId);

    const couponUser = await User.findById(userId);
    if (!couponUser)
      return res.status(404).send({ message: "User Not Found!" });

    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).send({ message: "Coupon Not Found!" });
    // coupon.rewardCoupons = [];
    // await coupon.save();
    // return res.status(200).send("deletd");

    // check coupon has reach its filnal limit or not
    if (coupon.rewardCoupons.length >= coupon.quantity) {
      //change coupon status expire or full
      coupon.status = COUPON_STATUS_FULL;
      await coupon.save();
      return res.status(400).send({
        message: "Coupon have reached its limits, you can not use this coupon",
      });
    }
    // coupon has not reach its filnal limit
    // now check this user has redeem already or not
    const user = coupon.rewardCoupons.find(
      (singleUser) => singleUser.redeemer == userId
    );
    // console.log("user in coupons : ", user);
    // Ager user hai to, check karenge ki user kitne bar redeem kiya hai is coupon ko and maximum time kitna hai
    if (user) {
      if (coupon.couponRewardInfo.redeemFrequency >= user.redeemedFrequency) {
        return res.status(400).send({
          message: `You can use this coupon only ${coupon.couponRewardInfo.redeemFrequency} and you have allready use this coupon ${coupon.couponRewardInfo.redeemFrequency} times.`,
        });
      } else {
        // Jab  singleUser.redeemedFrequency < coupon.couponRewardInfo.redeemFrequency came to else part
        const updatedCoupon = await Coupon.updateOne(
          {
            _id: couponId,
            "rewardCoupons.redeemer": userId,
          },

          { $inc: { "rewardCoupons.$.redeemedFrequency": 1 } }
        );
        // console.log("updatedCoupon : ", updatedCoupon);
        return res.status(200).send(updatedCoupon);
      }
    }
    // if user not exist in coupon.rewardCoupons , it came into else part
    // create a new user for this coupon
    const singleCouponId = new mongoose.Types.ObjectId();
    // single user coupon data
    const data = {
      _id: singleCouponId,
      redeemer: userId,
      redeemedFrequency: 1,
      email: couponUser.email,
      status: "CLAIMED",
      claimedLocation: screen.address,
    };
    coupon.rewardCoupons.push(data); // pusing data value into rewardCoupons array

    const updatedCoupon = await coupon.save();
    // console.log("updatedCoupon : ", updatedCoupon);
    // saving coupon and user coupon details to user also to find all user coupon list easily

    const updateUser = await User.updateOne(
      { _id: couponUser._id },
      {
        $push: { rewardCoupons: coupon._id },
      }
    );
    // console.log("updated user : ", updateUser);
    return res.status(200).send({
      couponReward: updatedCoupon,
      userCouponDetails: updateUser,
    });
  } catch (error) {
    // console.log("eeeeeeee : ", error);
    return res.status(500).send({
      message: `Error in addRedeemerToCoupon ${error.message}`,
    });
  }
}

// get coupon list by user id
export async function getCouponListForUser(req, res) {
  try {
    // console.log("getCouponListForUser called! ", req.params.userId);
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found!");
    //check user.rewardCoupons.length
    if (user.rewardCoupons.length === 0) return res.status(200).send([]);

    const coupons = [];
    for (let couponId of user.rewardCoupons) {
      const coupon = await Coupon.findById(couponId);
      if (coupon) {
        coupons.push(coupon);
      }
    }
    //you got user coupon list, now sent to user
    return res.status(200).send(coupons);
  } catch (error) {
    console.log("error : ", error);
    return res.status(500).send({
      message: `Error in getCouponListForUser ${error.message}`,
    });
  }
}
