import express from "express";
import {
  addNewCampaignForMultipleScreen,
  xxx,
} from "../controllers/campaignForMultipleScreenController.js";
const campaignForMultipleScreenRouter = express.Router();

//post

campaignForMultipleScreenRouter.post(
  "/create",
  addNewCampaignForMultipleScreen
);

//get

//put

//delete

export default campaignForMultipleScreenRouter;
