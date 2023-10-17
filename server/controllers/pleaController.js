import Plea from "../models/pleaModel.js";
import Screen from "../models/screenModel.js";
import User from "../models/userModel.js";
import Campaign from "../models/campaignModel.js";
import Media from "../models/mediaModel.js";
import mongoose from "mongoose";
import {
  CAMPAIGN_STATUS_ACTIVE,
  CAMPAIGN_STATUS_REJECTED,
} from "../Constant/campaignStatusConstant.js";
import Coupon from "../models/couponModel.js";

export async function getAllPleaListForBrand(req, res) {
  try {
    const userId = req.params.userId;
    const pleas = await Plea.find({ from: userId });
    return res.status(200).send(pleas);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Plea router error ${error.message}` });
  }
}
export async function getAllPleaRequestAsScreenOwner(req, res) {
  try {
    const screenOwnerUserId = req.params.id;
    const pleas = await Plea.find({ to: screenOwnerUserId });
    return res.status(200).send(pleas);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Plea router error ${error.message}` });
  }
}
export async function getPleaRequestListByScreenID(req, res) {
  try {
    const screenId = req.params.id;
    const pleas = await Plea.find({ screen: screenId });
    return res.status(200).send(pleas);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Plea router error ${error.message}` });
  }
}

export async function giveAccessToCampaignAllyPlea(req, res) {
  try {
    // console.log("giveAccessToCampaignAllyPlea called!");
    const pleaId = req.params.id;

    const plea = await Plea.findById(pleaId);
    if (!plea) {
      return res.status(404).send({ message: "Plea not found!" });
    }

    const campaign = await Campaign.findById(plea.campaign);
    const screen = await Screen.findOne({ _id: plea.screen });
    const master = await User.findOne({
      _id: plea.to,
      // defaultWallet: plea.to
    });
    const user = await User.findOne({
      _id: plea.from,
      // defaultWallet: plea.from
    });
    const remark = `${user.name} user has been given an Campaign Ally access for ${screen.name} screen from ${master.name} user`;

    plea.status = true;
    plea.reject = false;
    plea.remarks.push(remark);

    // Change status of campaign as "active"
    campaign.status = CAMPAIGN_STATUS_ACTIVE;

    await plea.save();
    await campaign.save();

    console.log("granting campaign ally access");

    return res
      .status(200)
      .send({ message: "successfull given permition", plea });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Pleas router error ${error.message}` });
  }
}
export async function rejectCampaignAllyPlea(req, res) {
  try {
    console.log("rejectCampaignAllyPlea called!");
    const pleaId = req.params.id;
    const plea = await Plea.findById(pleaId);
    const screen = await Screen.findOne({ _id: plea.screen });
    const campaign = await Campaign.findById(plea.campaign);

    const master = await User.findOne({
      _id: plea.to,
      // defaultWallet: plea.to
    });
    const user = await User.findOne({
      _id: plea.from,
      // defaultWallet: plea.from
    });
    const remark = `${user.name} user has been rejected an Campaign Ally access for ${screen.name} screen from ${master.name} user`;

    plea.status = false;
    plea.reject = true;
    plea.remarks.push(remark);
    campaign.status = CAMPAIGN_STATUS_REJECTED;

    await plea.save();
    await campaign.save();
    return res
      .status(200)
      .send({ message: "Rejected campaign plea request ", plea });
  } catch (error) {
    return res.status(500).send({
      message: `rejectCampaignAllyPlea router error ${error.message}`,
    });
  }
}

export async function addNewPleaForUserRedeemCouponOffer(req, res) {
  try {
    console.log("addNewPleaForUserRedeemCouponOffer called!");
    const fromUser = await User.findOne({
      _id: req.params.fromUser,
    });
    const toUser = await User.findOne({
      _id: req.params.toUser,
    });
    const coupon = await Coupon.findById(req.params.couponId);
    if (!fromUser && !toUser && !coupon) {
      return res
        .status(400)
        .send({ message: "User or user coupon not found!" });
    }
    // before going to create new plea first check plea exist with same coupon code or not
    //if not then create new plea

    const oldPlea = await Plea.findOne({
      couponId: req.params.couponId,
      to: toUser._id,
    });
    if (oldPlea) {
      return res.status(500).send({
        message: "Plea already made with same coupon code with same user",
      });
    }
    const plea = new Plea({
      _id: new mongoose.Types.ObjectId(),
      from: fromUser._id,
      to: toUser._id,
      couponId: coupon._id,
      couponCode: coupon.couponCode,
      pleaType: "COUPON_REDEEM_PLEA",
      content: `I would like to request a coupon plea for this ${coupon.couponCode} couponCode`,
      status: false,
      reject: false,
      blackList: false,
      remarks: `${fromUser.name} has requested a readeem coupon  plea for ${coupon.couponCode} couponCode`,
    });
    const savedPlea = await plea.save();
    fromUser.pleasMade.push(plea);
    await fromUser.save();
    return res.status(200).send(savedPlea);
  } catch (error) {
    console.log("Errror : ", error);
    return res.status(500).send({
      message: `Plea router error  in addNewPleaForUserRedeemCouponOffer ${error.message}`,
    });
  }
}

export async function addPurchaseDetailsInCoupon(req, res) {
  try {
    console.log("addPurchaseDetailsInCoupon called!");
    const couponId = req.body.couponId;
    const fromUser = req.body.fromUser;
    const toUser = req.body.toUser;
    const pleaId = req.body.plaeId;
    const purchaseAmount = req.body.purchaseAmount;
    const savedAmount = req.body.savedAmount;
    const date = new Date();
    console.log("req.body : ", req.body);

    const plea = await Plea.findById(pleaId);

    const coupon = await Coupon.findById(couponId);

    if (!plea || !coupon) {
      return res.status(404).send({ message: "Data not found" });
    }

    let rewardCoupons = coupon.rewardCoupons;
    rewardCoupons = rewardCoupons.map((data) => {
      if (data.redeemer == fromUser) {
        if (
          data.additionalInfo.length < coupon.couponRewardInfo.redeemFrequency
        ) {
          data.additionalInfo.push({
            purchaseAmount,
            savedAmount,
            date,
            user: toUser,
          });
          data.additionalInfo = data.redeemedFrequency =
            data.redeemedFrequency + 1;
          console.log("data");
        }
      }
      return data;
    });
    coupon.rewardCoupons = rewardCoupons;
    const updatedCoupon = await coupon.save();
    plea.status = true;
    await plea.save();
    console.log("updatedCoupon : ", updatedCoupon);
    return res.status(200).send(coupon);
  } catch (error) {
    console.log("error : ", error);
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

export async function xxx(req, res) {
  try {
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}
