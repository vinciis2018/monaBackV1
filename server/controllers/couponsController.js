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
import { ObjectId } from "mongodb";

export const createNewCoupon = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.brandId);
    // console.log(brand);
    if (!brand) {
      return res.status(404).send("No brand found");
    }

    // first find all camapign with same name and cid for comming coupon id:
    let campaignsId = [];

    for (let campaignId of req.body.campaigns) {
      const campaign = await Campaign.findById(campaignId);
      const campaigns = await Campaign.find({
        cid: campaign?.cid,
        campaignName: campaign.campaignName,
        status: CAMPAIGN_STATUS_ACTIVE,
        ally: campaign.ally,
      });
      const ids = campaigns.map((campaign) => campaign._id);
      campaignsId = [...campaignsId, ...ids];
    }

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
      allCampaigns: campaignsId,
      rewardOfferPartners: req.body.rewardOfferPartners || [],

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
        onlineURL: req.body.onlineURL || "",

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
    // Iterate each campaign id and add coupon to the each camapign
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
    return res.status(500).send({
      message: `Coupon Reward controller error at createNewCoupon ${error.message}`,
    });
  }
};

export async function getCouponListForBrand(req, res) {
  try {
    const brand = await Brand.findById(req.params.brandId);
    if (!brand) return res.status(404).send("No brand found");
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
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);

    if (!coupon) return res.status(404).send({ message: "Coupon not found!" });

    // before going to add campaign in coupon
    // 1. first check old campaign present or not if not delete coupon from camoaigns
    const newCampaignId = req.body.campaigns || [];
    // console.log("newCampaigns : ", newCampaignId);
    // console.log("coupon.campaigns : ", coupon.campaigns);
    let oldCampaigns = [];
    let allCampaigns = [];
    for (let id of coupon.campaigns) {
      if (newCampaignId.find((x) => x == id)) {
        // old campaign id present in new campaign id
        oldCampaigns.push(id);
      } else {
        // old campaign id has removed
        // so we need to delete coupon from old camapigns and also delete camapigns id from allCampaigns in coupon
        const campaign = await Campaign.findById(id);
        const campaigns = await Campaign.find({
          cid: campaign?.cid,
          campaignName: campaign.campaignName,
          status: CAMPAIGN_STATUS_ACTIVE,
          ally: campaign.ally,
        });
        const ids = campaigns.map((campaign) => campaign._id);

        for (let campaignId of ids) {
          const campaign = await Campaign.findById(campaignId);
          // console.log("before campaigns : ", campaign.coupons);
          campaign.coupons = campaign.coupons.filter((id) => id != couponId);
          const updatedCampaign = await campaign.save();
          // console.log("updated campaigns : ", updatedCampaign.coupons);
        }
      }
    }
    // 2. iterate req.body.campaigns to check if any new id present then attached coupon to that campaigns
    for (let id of newCampaignId) {
      if (!oldCampaigns.find((x) => x == id)) {
        // added new campaign added while update coupon
        const campaign = await Campaign.findById(id);
        const campaigns = await Campaign.find({
          cid: campaign?.cid,
          campaignName: campaign.campaignName,
          status: CAMPAIGN_STATUS_ACTIVE,
          ally: campaign.ally,
        });
        const ids = campaigns.map((campaign) => campaign._id);

        for (let id of ids) {
          const campaign = await Campaign.findById(id);
          if (!campaign.coupons.includes(couponId)) {
            campaign.coupons.push(couponId);
          }
          const updatedcampaign = await campaign.save();
          // console.log("updatedcampaign  : ", updatedcampaign);
        }
      }
    }

    for (let id of req.body.campaigns) {
      const campaign = await Campaign.findById(id);
      const campaigns = await Campaign.find({
        cid: campaign?.cid,
        campaignName: campaign.campaignName,
        status: CAMPAIGN_STATUS_ACTIVE,
        ally: campaign.ally,
      });
      const ids = campaigns.map((campaign) => campaign._id);
      allCampaigns = [...allCampaigns, ...ids];
    }

    coupon.offerName = req.body.offerName || coupon.offerName;
    coupon.offerDetails = req.body.offerDetails || coupon.offerDetails;

    coupon.quantity = req.body.quantity || coupon.quantity;
    coupon.couponCode = req.body.couponCode || coupon.couponCode;
    coupon.campaigns = req.body.campaigns;
    coupon.allCampaigns = allCampaigns;

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
    coupon.couponRewardInfo.onlineURL =
      req.body.onlineURL || coupon.couponRewardInfo.onlineURL;
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
    coupon.rewardOfferPartners =
      req.body.rewardOfferPartners || coupon.rewardOfferPartners;

    const updatedCoupon = await coupon.save();

    // console.log("coupon updated successfully!");
    return res.status(200).send(updatedCoupon);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at editCouponDetails ${error.message}`,
    });
  }
}

export const getAllActiveCouponList = async (req, res) => {
  try {
    const coupons = await Coupon.find({ status: COUPON_STATUS_ACTIVE });

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
    console.log("oupon.allCampaigns : ", coupon);
    // change for parmanent delete or not
    if (status === COUPON_STATUS_DELETED) {
      if (coupon.allCampaigns.length > 0) {
        // first remove coupon from each campaigns which attached to this coupon
        for (let campaignId of coupon.allCampaigns) {
          const campaign = await Campaign.findById(campaignId);
          // console.log("before campaigns : ", campaign.coupons);
          campaign.coupons = campaign.coupons.filter((id) => id != couponId);
          const updatedCampaign = await campaign.save();
          // console.log("updated campaigns : ", updatedCampaign.coupons);
        }
      } else if (coupon.campaigns > 0) {
        let campaignsId = [];

        for (let campaignId of coupon.campaigns) {
          const campaign = await Campaign.findById(campaignId);
          const campaigns = await Campaign.find({
            cid: campaign?.cid,
            campaignName: campaign.campaignName,
            status: CAMPAIGN_STATUS_ACTIVE,
            ally: campaign.ally,
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
      const deletedCoupon = await coupon.delete();
      // console.log("DELETD COUPON PERMANENTLY : ", deletedCoupon);
      return res.status(200).send(deletedCoupon);
    }
    coupon.status = status;
    const updatedCoupon = await coupon.save();
    // console.log("delted coupon : ", deletedCoupon);
    return res.status(200).send(updatedCoupon);
  } catch (error) {
    console.log(" error in delete coupon : ", error);
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

    // console.log(req.params);
    const screen = await Screen.findById(screenId);
    const couponUser = await User.findById(userId);
    const coupon = await Coupon.findById(couponId);

    if (!couponUser) {
      return res.status(404).send({ message: "User Not Found!" });
    }
    if (!coupon) {
      return res.status(404).send({ message: "Coupon Not Found!" });
    }
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
    const user = coupon.rewardCoupons.filter(
      (u) => u.email === couponUser.email
    );
    console.log(coupon.rewardCoupons);
    console.log(user);
    console.log(coupon);

    // Ager user hai to, check karenge ki user kitne bar redeem kiya hai is coupon ko and maximum time kitna hai
    if (user.length === 0) {
      // if user not exist in coupon.rewardCoupons , it came into else part
      // create a new user for this coupon
      const singleCouponId = new mongoose.Types.ObjectId();
      // single user coupon data
      const data = {
        _id: singleCouponId,
        redeemer: userId,
        redeemedFrequency: coupon.couponRewardInfo.redeemFrequency,
        email: couponUser.email,
        status: "CLAIMED",
        claimedLocation: screen.screenAddress,
        claimedScreen: screen._id,
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
    } else {
      return res.status(400).send({
        message: `You have already claimed this coupon.`,
      });
      // Jab  singleUser.redeemedFrequency < coupon.couponRewardInfo.redeemFrequency came to else part
      // const updatedCoupon = await Coupon.updateOne(
      //   {
      //     _id: couponId,
      //     "rewardCoupons.redeemer": userId,
      //   },

      //   { $inc: { "rewardCoupons.$.redeemedFrequency": 1 } }
      // );
      // console.log("updatedCoupon : ", updatedCoupon);
      // return res.status(200).send(updatedCoupon);
    }
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

export async function getCouponDetailsAlongWithCampaignsAndScreens(req, res) {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).send({ message: "Coupon not cound" });
    const campaigns = await Campaign.find({
      _id: { $in: coupon.allCampaigns },
    });
    const screenIds = campaigns.map((campaign) => campaign.screen);
    const screens = await Screen.find({ _id: { $in: screenIds } });

    return res.status(200).send({
      coupon,
      screens,
      campaigns,
    });
  } catch (error) {
    console.log("error : ", error);
    return res.status(500).send({
      message: `Error in getCouponDetails ${error.message}`,
    });
  }
}

export async function addOrRemoveCouponToUserWishlist(req, res) {
  try {
    const action = req.body.action; // ADD or REMOVE
    const userId = req.body.userId;
    const couponId = req.body.couponId;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).send({ message: "Coupon not found!" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found!" });

    if (action === "ADD") {
      if (user.wishlist.find((id) => id == couponId)) {
        return res.status(200).send({ message: "Added successfully!" });
      }
      user.wishlist = [...user.wishlist, couponId];
      const updatedUser = await user.save();
      return res.status(200).send({ message: "Added successfully!" });
    } else if (action === "REMOVE") {
      user.wishlist = user.wishlist.filter((id) => id != couponId);
      const updatedUser = await user.save();
      // console.log("updatedUser : ", updatedUser?.wishlist);
      return res.status(200).send({ message: "Added successfully!" });
    }
  } catch (error) {
    return res.status(500).send({
      message: `Error in addOrRemoveCouponToUserWishlist ${error.message}`,
    });
  }
}
