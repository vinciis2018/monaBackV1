import express from "express";
import {
  createRewardOffer,
  myCreatedRewardOffers,
  getRewardOfferDetails,
  editRewardOffer,
} from "../controllers/rewardController.js";
import { isAuth } from "../utils/authUtils.js";

const rewardRouter = express.Router();

//post request
rewardRouter.post("/createReward", isAuth, createRewardOffer); //tested
rewardRouter.get("/myCreatedRewards/:id", myCreatedRewardOffers);
rewardRouter.get("/reward/:id", getRewardOfferDetails);
rewardRouter.put("/reward/:id", isAuth, editRewardOffer);
export default rewardRouter;
