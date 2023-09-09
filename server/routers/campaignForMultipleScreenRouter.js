import express from "express";
import {
  addNewCampaignForMultipleScreen,
  createCampaignBasedOnAudiancesProfile,
  filterScreensBasedOnAudiancesProfile,
} from "../controllers/campaignForMultipleScreenController.js";
const campaignForMultipleScreenRouter = express.Router();

//post

campaignForMultipleScreenRouter.post(
  "/create",
  addNewCampaignForMultipleScreen
);
campaignForMultipleScreenRouter.post(
  "/getScreens",
  filterScreensBasedOnAudiancesProfile
);
campaignForMultipleScreenRouter.post(
  "/createCampaign",
  createCampaignBasedOnAudiancesProfile
);

//get

//put

//delete

export default campaignForMultipleScreenRouter;
