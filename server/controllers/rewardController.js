import mongoose from "mongoose";

import RewardProgram from "../models/rewardModel.js";


export async function getAllRewards(req, res) {
  try {
    const allRewards = await Reward.find();
    if (!allRewards) return res.status(404).send("No Rewards Found!");
    return res.status(200).send(allRewards);
  } catch (error) {
    return res.status(500).send({ message: `Reward router error ${error.message}` });
  }
}

export async function createRewardProgram(req, res) {
  try {
    // brand creates a reward program, which mints reward coupons from user interaction
     const rewardId = new mongoose.Types.ObjectId();

     const rewardProgram = new RewardProgram({
      _id: rewardId,
      programCreator: req.body.user,
      programName: "Sample Reward" + Date.now() || req.body.programName,
      brand: "Brand00000",
      brandName: "Brand Name",
      quantity: 0 || req.body.quantity,
      rewardProgramType: {
        type: "" || req.body.rewardProgramType,
      }, 
      ratings: 0,
      reviews: [],
      programInfo: {},
      createdOn: Date.now(),
    });

    const createdRewardProgram = await rewardProgram.save();
    return res.status(200).send(createdRewardProgram);
  } catch (error) {
    return res.status(500).send({ message: `Reward controller error at createRewardProgram ${error.message}` });
  }
}


export async function editRewardProgram(req, res) {
  try {
    const rewardProgram = await RewardProgram.findById(req.params.id);
    // console.log(rewardProgram);
    rewardProgram.programName = req.body.name || rewardProgram.programName;
    rewardProgram.quantity = req.body.quantity || rewardProgram.quantity;
    rewardProgram.rewardProgramType.type = req.body.rewardProgramType || rewardProgram.rewardProgramType.type;

    if (req.body.rewardProgramType === "coupon") {
      const rewardCoupon = {
        couponType: req.body.rewardCouponType,
        validity: {
          to: req.body.couponValidityTo,
          from: req.body.couponValidityFrom
        },
        couponItem: req.body.couponItem,
        redeemFrequency: req.body.couponRedeemFrequency,
        couponInfo: {
          type: req.body.discountCouponType,
          value: req.body.discountCouponValue,
          freeItemQuantity: req.body.freeItemQuantity,
        }
      }
      if (rewardProgram.rewardProgramType.cardReward !== null) {
        rewardProgram.rewardProgramType.cardReward = null;
      }
      rewardProgram.rewardProgramType.couponReward = rewardCoupon;
    }

    if (req.body.rewardProgramType === "card") {
      const rewardCard = {
        cardType: req.body.rewardCardType,
        validity: {
          to: req.body.cardValidityTo,
          from: req.body.cardValidityFrom
        },
        cardMilestones: req.body.milestone,
        cardM
      };
      if (rewardProgram.rewardProgramType.couponReward !== null) {
        rewardProgram.rewardProgramType.couponReward = null;
      }
      rewardProgram.rewardProgramType.cardReward = rewardCard;
    }

    const updatedRewardProgram = await rewardProgram.save();

    return res.status(200).send(updatedRewardProgram);

  } catch (error) {
    return res.status(500).send({ message: `Reward controller error at editRewardProgram ${error.message}` });
  }
}

export async function myCreatedRewardPrograms(req, res) {
  try {
    const myRewardPrograms = await RewardProgram.find({ programCreator: req.params.id});
    // console.log([...myRewardPrograms]);
    return res.status(200).send([...myRewardPrograms]);
  } catch (error) {
    return res.status(500).send({ message: `Reward controller error at myCreatedRewardPrograms ${error.message}` });
  }
}

export async function getRewardProgramDetails(req, res) {
  try {
    const rewardProgram = await RewardProgram.findOne({ _id: req.params.id })
    return res.status(200).send(rewardProgram);
  } catch (error) {
    return res.status(500).send({ message: `Reward controller error at getRewardProgramDetails ${error.message}` });
  }
}