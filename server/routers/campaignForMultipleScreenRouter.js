import express from "express";
import {
  addNewCampaignForMultipleScreen,
  createCampaignBasedOnAudiancesProfile,
} from "../controllers/campaignForMultipleScreenController.js";
const campaignForMultipleScreenRouter = express.Router();

//post

campaignForMultipleScreenRouter.post(
  "/create",
  addNewCampaignForMultipleScreen
);

campaignForMultipleScreenRouter.post(
  "/createCampaign",
  createCampaignBasedOnAudiancesProfile
);

//get

//put

//delete

export default campaignForMultipleScreenRouter;
