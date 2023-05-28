import User from "../models/userModel.js";
import CouponRewardOffer from "../models/couponRewardOfferModel.js";
import mongoose from "mongoose";
import Campaign from "../models/campaignModel.js";
import { generateRandonNumberOfLengthN } from "../utils/utils.js";

export async function createNewCouponRewardOffer(req, res) {
  try {
    console.log("createNewCouponRewardOffer called!  ");
    const rewardId = new mongoose.Types.ObjectId();

    const rewardOffer = new CouponRewardOffer({
      _id: rewardId,
      offerCreator: req.body.user,
      offerName: req.body.offerName || "Sample Reward" + Date.now(),
      brand: req.user.brand,
      quantity: 0 || req.body.quantity,
      ratings: 0,
      reviews: [],
      offerInfo: {},
      createdOn: Date.now(),
    });
    const createdCouponReward = await rewardOffer.save();
    console.log("createdCouponReward created! ", createdCouponReward);
    return res.status(200).send(createdCouponReward);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at createNewCouponRewardOffer ${error.message}`,
    });
  }
}

export async function editCouponRewardOffer(req, res) {
  try {
    console.log("editCouponRewardOffer req.body: ", req.body);
    const couponRewardOffer = await CouponRewardOffer.findById(req.params.id);
    couponRewardOffer.offerName = req.body.offerName;
    couponRewardOffer.brandName = req.body.brandName;
    couponRewardOffer.quantity = req.body.quantity;

    couponRewardOffer.couponRewardInfo.couponType =
      req.body.couponType || couponRewardOffer.couponRewardInfo.couponType;

    couponRewardOffer.couponRewardInfo.couponItem =
      req.body.couponItem || couponRewardOffer.couponRewardInfo.couponItem;

    couponRewardOffer.couponRewardInfo.redeemFrequency =
      req.body.couponRedeemFrequency ||
      couponRewardOffer.couponRewardInfo.redeemFrequency;

    couponRewardOffer.couponRewardInfo.couponInfo.type =
      req.body.couponInfoType ||
      couponRewardOffer.couponRewardInfo.couponInfo.type;

    couponRewardOffer.couponRewardInfo.couponInfo.value =
      req.body.couponInfoValue ||
      couponRewardOffer.couponRewardInfo.couponInfo.value;

    couponRewardOffer.couponRewardInfo.couponInfo.freeItemQuantity =
      req.body.freeItemQuantity ||
      couponRewardOffer.couponRewardInfo.couponInfo.freeItemQuantity;

    couponRewardOffer.couponRewardInfo.validity.to =
      req.body.couponValidityTo ||
      couponRewardOffer.couponRewardInfo.validity.to;

    couponRewardOffer.couponRewardInfo.validity.from =
      req.body.couponValidityFrom ||
      couponRewardOffer.couponRewardInfo.validity.from;
    couponRewardOffer.rewardOfferPartners =
      req.body.reardPartner || couponRewardOffer.rewardOfferPartners;

    const updatedCouponRewad = await couponRewardOffer.save();
    return res.status(200).send(updatedCouponRewad);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at editCouponRewardOffer ${error.message}`,
    });
  }
}

export async function getCouponRewardOfferListForBrand(req, res) {
  try {
    console.log("getCouponRewardOfferListForBrand called");
    const myRewardOffers = await CouponRewardOffer.find({
      offerCreator: req.params.id,
    });
    return res
      .status(
        200 // console.log([...myRewardOffers]);
      )
      .send([...myRewardOffers]);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at getCouponRewardOfferListForBrand ${error.message}`,
    });
  }
}
export async function getCouponRewadOfferDetailsForBrand(req, res) {
  try {
    const rewardOffer = await CouponRewardOffer.findOne({ _id: req.params.id });
    return res.status(200).send(rewardOffer);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at getCouponRewadOfferDetailsForBrand ${error.message}`,
    });
  }
}

export async function AddCampaignToCoupons(req, res) {
  try {
    const couponId = req.query.coupon;
    let campaignsId = req.query.campaigns;
    campaignsId = campaignsId[0].split(",");
    // console.log("campaignsId : ", campaignsId.split(","));
    console.log("type of  ", typeof campaignsId);
    console.log("campaignsId : ", campaignsId[0].split(","));

    // campaignsId.split(",").forEach((campaign) => {
    //   console.log(`Campaign id : ${campaign}`);
    // });

    const updatedCoupon = await CouponRewardOffer.updateOne(
      { _id: couponId },
      { $push: { campaigns: [...campaignsId] } }
    );
    for (let campaignId of campaignsId) {
      const updatedCampaign = await Campaign.updateOne(
        { _id: campaignId },
        { $push: { couponRewads: couponId } }
      );
      console.log("updated Campaign : ", updatedCampaign);
    }
    return res.status(200).send(updatedCoupon);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at AddCampaignToCoupons ${error.message}`,
    });
  }
}

export async function addRedmeerToCoupon(req, res) {
  try {
    console.log("addRedmeerToCoupon called!");
    const couponId = req.params.couponId;
    const coupon = await CouponRewardOffer.findById(couponId);
    const user = await User.findById(req.params.userId);
    if (!coupon) {
      return res.status(404).send({ message: "No coupon found!" });
    }
    // this user already added to thsi coupon or not if not then add this user to coupon else return  its data

    const couponUser = coupon.rewardCoupons.find(
      (coupon) => coupon.redeemer == req.params.userId
    );

    if (couponUser) {
      console.log("coupon with this user present");
      return res.status(200).send({
        couponReward: coupon,
        userCouponDetails: couponUser,
      });
    }
    const couponCode = generateRandonNumberOfLengthN(8);
    // console.log("couponcode", couponCode);
    const singleCouponId = new mongoose.Types.ObjectId();
    // single user coupon data
    const data = {
      _id: singleCouponId,
      couponCode: couponCode,
      redeemer: req.params.userId,
      hasRedeem: false,
    };
    coupon.rewardCoupons.push(data); // pusing data value into rewardCoupons array
    // const updatedCoupon = await CouponRewardOffer.updateOne(
    //   { _id: couponId },
    //   { $push: { rewardCoupons: data } }
    // );
    const updatedCoupon = await coupon.save();
    // console.log("updatedCoupon : ", updatedCoupon);
    // saving coupon and user coupon details to user also to find all user coupon list easily

    const updateUser = await User.updateOne(
      { _id: user._id },
      {
        $push: { rewardCoupons: coupon._id },
      }
    );
    // console.log("updated user : ", updateUser);
    return res.status(200).send({
      couponReward: coupon,
      userCouponDetails: data,
    });
  } catch (error) {
    // console.log("Error : ", error);
    return res.status(500).send({
      message: `Coupon Reward controller error at addRedmeerToCoupon ${error.message}`,
    });
  }
}

export async function getRewardOfferPartnerList(req, res) {
  try {
    const rewardOfferPartnerList = [];
    const couponId = req.params?.couponId;
    const coupon = await CouponRewardOffer.findById(couponId);
    if (!coupon) {
      return res.status(400).send({
        message: "No coupon found with this couponId",
      });
    }
    // itrating coupon?.rewardOfferPartners to get details of each reward offer partner
    for (let userId of coupon?.rewardOfferPartners) {
      const user = await User.findById(userId, {
        name: 1,
        email: 1,
        phone: 1,
        avatar: 1,
        address: 1,
        districtCity: 1,
        stateUt: 1,
        isItanimulli: 1,
        isViewer: 1,
        isMaster: 1,
        master: 1,
        isAlly: 1,
        ally: 1,
        isBrand: 1,
        brand: 1,
        defaultWallet: 1,
      });
      rewardOfferPartnerList.push(user);
    }
    console.log("rewardOfferPartnerList : ", rewardOfferPartnerList);
    return res.status(200).send(rewardOfferPartnerList);
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at getRewardOfferPartnerList ${error.message}`,
    });
  }
}

export async function xxxx(req, res) {
  try {
  } catch (error) {
    return res.status(500).send({
      message: `Coupon Reward controller error at createNewCouponRewardOffer ${error.message}`,
    });
  }
}