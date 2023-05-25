import mongoose from "mongoose";

import RewardOffer from "../models/rewardModel.js";

export async function getAllRewards(req, res) {
  try {
    const allRewards = await Reward.find();
    if (!allRewards) return res.status(404).send("No Rewards Found!");
    return res.status(200).send(allRewards);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Reward router error ${error.message}` });
  }
}

export async function createRewardOffer(req, res) {
  try {
    // brand creates a reward offer, which mints reward coupons from user interaction
    console.log("createRewardOffer called!");
    const rewardId = new mongoose.Types.ObjectId();

    const rewardOffer = new RewardOffer({
      _id: rewardId,
      offerCreator: req.body.user,
      offerName: req.body.offerName || "Sample Reward" + Date.now(),
      brand: req.user.brand,
      quantity: 0 || req.body.quantity,
      rewardOfferType: {
        type: "" || req.body.rewardOfferType,
      },
      ratings: 0,
      reviews: [],
      offerInfo: {},
      createdOn: Date.now(),
    });

    const createdRewardOffer = await rewardOffer.save();
    console.log("createRewardOffer created! ", createdRewardOffer);
    return res.status(200).send(createdRewardOffer);
  } catch (error) {
    return res.status(500).send({
      message: `Reward controller error at createRewardOffer ${error.message}`,
    });
  }
}

export async function editRewardOffer(req, res) {
  try {
    const rewardOffer = await RewardOffer.findById(req.params.id);
    console.log(" req.body : ", req.body);
    rewardOffer.offerName = req.body.offerName || rewardOffer.offerName;
    rewardOffer.quantity = req.body.quantity || rewardOffer.quantity;
    rewardOffer.brandName = req.body.brandName || rewardOffer.brandName;

    rewardOffer.rewardOfferType.type =
      req.body.rewardOfferType || rewardOffer.rewardOfferType.type;
    const rewardCoupon = {
      couponType: req.body.rewardCouponType,
      validity: {
        to: req.body.couponValidityTo,
        from: req.body.couponValidityFrom,
      },
      couponItem: req.body.couponItem,
      redeemFrequency: req.body.couponRedeemFrequency,
      couponInfo: {
        type: req.body.discountCouponType,
        value: req.body.discountCouponValue,
        freeItemQuantity: req.body.freeItemQuantity,
      },
      graphicInfo: {
        mediaFiles: req.body.mediaFiles,
        graphicText: req.body.graphicText,
        fontStyle: req.body.fontStyle,
        backgroundColors: req.body.backgroundColors,
      },
    };

    if (req.body.rewardOfferType === "coupon") {
      console.log("req.body.rewardOfferType === coupon");
      if (rewardOffer.rewardOfferType.cardReward !== null) {
        rewardOffer.rewardOfferType.cardReward = null;
      }
      rewardOffer.rewardOfferType.couponReward = rewardCoupon;
    }

    if (req.body.rewardOfferType === "card") {
      console.log("req.body.rewardOfferType === card");
      const rewardCard = {
        cardType: req.body.rewardCardType,
        validity: {
          to: req.body.cardValidityTo,
          from: req.body.cardValidityFrom,
        },
        // cardMilestones: req.body.milestone,
        cardMilestonesReward: req.body.cardMilestonesReward,
      };
      console.log("rewardCard 00000; ", rewardCard);
      if (rewardOffer.rewardOfferType.couponReward !== null) {
        rewardOffer.rewardOfferType.couponReward = null;
      }
      rewardOffer.rewardOfferType.cardReward = rewardCard;
    }

    const updatedRewardOffer = await rewardOffer.save();
    console.log("updatedRewardOffer : ", updatedRewardOffer);

    return res.status(200).send(updatedRewardOffer);
  } catch (error) {
    return res.status(500).send({
      message: `Reward controller error at editRewardOffer ${error.message}`,
    });
  }
}

export async function myCreatedRewardOffers(req, res) {
  try {
    const myRewardOffers = await RewardOffer.find({
      offerCreator: req.params.id,
    });
    // console.log([...myRewardOffers]);
    return res.status(200).send([...myRewardOffers]);
  } catch (error) {
    return res.status(500).send({
      message: `Reward controller error at myCreatedRewardOffers ${error.message}`,
    });
  }
}

export async function getRewardOfferDetails(req, res) {
  try {
    const rewardOffer = await RewardOffer.findOne({ _id: req.params.id });
    return res.status(200).send(rewardOffer);
  } catch (error) {
    return res.status(500).send({
      message: `Reward controller error at getRewardOfferDetails ${error.message}`,
    });
  }
}
