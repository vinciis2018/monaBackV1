import express from "express";

import { isAuth } from "../utils/authUtils.js";
import {
  createNewCardRewardOffer,
  editCardRewardOffer,
  getCardRewadOfferDetailsForBrand,
  getCardRewardOfferListForBrand,
} from "../controllers/cardRewardOfferController.js";
const cardRewardOfferRouter = express.Router();

// post
cardRewardOfferRouter.post("/create", isAuth, createNewCardRewardOffer);

// put
cardRewardOfferRouter.put("/cardReward/:id", isAuth, editCardRewardOffer);

// get
cardRewardOfferRouter.get(
  "/cardRewardOfferListForBrand/:id",
  getCardRewardOfferListForBrand
);
cardRewardOfferRouter.get(
  "/cardRewardOfferDetailForBrand/:id",
  getCardRewadOfferDetailsForBrand
);

export default cardRewardOfferRouter;
