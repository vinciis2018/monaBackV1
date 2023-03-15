import express from "express";
import {
  addNewCampaign,
  getCampaignAndMediaListByScreenId,
  getCampaignDetail,
  getCampaignList,
  getCampaignListByScreenId,
  getCampaignListByScreenName,
  updateCampaignById,
  deleteCampaign,
} from "../controllers/campaignController.js";

import { isAuth } from "../utils/authUtils.js";

const campaignRouter = express.Router();

//post request
campaignRouter.post("/create", isAuth, addNewCampaign);

//get request
campaignRouter.get("/:id/screen", getCampaignListByScreenId);
campaignRouter.get("/:name/screenName", getCampaignListByScreenName);
campaignRouter.get("/all", getCampaignList);
campaignRouter.get("/:id", getCampaignDetail);
campaignRouter.get(
  "/:id/screen/campaignAndMedia",
  getCampaignAndMediaListByScreenId
);
//put request
campaignRouter.put("/:id", updateCampaignById);

//delete request

campaignRouter.delete("/:id", deleteCampaign);

export default campaignRouter;
