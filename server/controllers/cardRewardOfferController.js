import User from "../models/userModel.js";
import CardRewardOffer from "../models/cardRewardOfferModel.js";
import mongoose from "mongoose";

export async function createNewCardRewardOffer(req, res) {
  try {
    console.log("createNewCardRewardOffer called!  ");
    const rewardId = new mongoose.Types.ObjectId();

    const rewardOffer = new CardRewardOffer({
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
    const createdCardReward = await rewardOffer.save();
    console.log("createdCardReward created! ", createdCardReward);
    return res.status(200).send(createdCardReward);
  } catch (error) {
    return res.status(500).send({
      message: `Card Reward controller error at createNewCardRewardOffer ${error.message}`,
    });
  }
}

export async function editCardRewardOffer(req, res) {
  try {
    console.log("editCardRewardOffer : ", req.body);
    const cardRewardOffer = await CardRewardOffer.findById(req.params.id);
    cardRewardOffer.offerName = req.body.offerName;
    cardRewardOffer.brandName = req.body.brandName;
    cardRewardOffer.quantity = req.body.quantity;

    cardRewardOffer.cardType =
      req.body.rewardCardType || cardRewardOffer.cardType;

    cardRewardOffer.validity.to =
      req.body.cardValidityTo || cardRewardOffer.validity.to;

    cardRewardOffer.validity.from =
      req.body.cardValidityFrom || cardRewardOffer.validity.from;
    cardRewardOffer.cardMilestonesRewards =
      req.body.cardMilestonesRewards || cardRewardOffer.cardMilestonesRewards;

    const updatedCardRewad = await cardRewardOffer.save();
    return res.status(200).send(updatedCardRewad);
  } catch (error) {
    return res.status(500).send({
      message: `Card Reward controller error at editCardRewardOffer ${error.message}`,
    });
  }
}

export async function getCardRewardOfferListForBrand(req, res) {
  try {
    console.log("getCardRewardOfferListForBrand called");
    const myRewardOffers = await CardRewardOffer.find({
      offerCreator: req.params.id,
    });
    return res
      .status(
        200 // console.log([...myRewardOffers]);
      )
      .send([...myRewardOffers]);
  } catch (error) {
    return res.status(500).send({
      message: `Card Reward controller error at getCardRewardOfferListForBrand ${error.message}`,
    });
  }
}
export async function getCardRewadOfferDetailsForBrand(req, res) {
  try {
    const rewardOffer = await CardRewardOffer.findOne({ _id: req.params.id });
    return res.status(200).send(rewardOffer);
  } catch (error) {
    return res.status(500).send({
      message: `Card Reward controller error at getCardRewadOfferDetailsForBrand ${error.message}`,
    });
  }
}
export async function xxxx(req, res) {
  try {
  } catch (error) {
    return res.status(500).send({
      message: `Error in getCouponListForUser ${error.message}`,
    });
  }
}
