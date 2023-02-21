import express from "express";
import {
  addNewCampaign,
  getCampaignList,
  getCampaignListByScreenId,
  getCampaignListByScreenName,
} from "../controllers/campaignController.js";

import { isAuth } from "../utils/authUtils.js";

const campaignRouter = express.Router();

//post request
campaignRouter.post("/create", isAuth, addNewCampaign);

//get request
campaignRouter.get("/:id/screen", getCampaignListByScreenId);
campaignRouter.get("/:name/screenName", getCampaignListByScreenName);
campaignRouter.get("/all", getCampaignList);

//put request

//delete request

export default campaignRouter;
