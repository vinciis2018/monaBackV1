import express from "express";
import {
  addNewCampaign,
  getCampaignAndMediaListByScreenId,
  getCampaignDetail,
  getCampaignList,
  getCampaignListByScreenId,
  getCampaignListByScreenName,
  updateCampaignById,
  changeCampaignStatus,
  getAllCampaignListByScreenId,
  getFilteredCampaignListBydateRange,
  getAllCampaignListByBrandId,
  getCampaignDetailWithCidAndCampaignName,
  deleteCampaignsPermanentlyByUserId,
  getCampaignLogs,
} from "../controllers/campaignController.js";

import { isAuth } from "../utils/authUtils.js";

const campaignRouter = express.Router();

//post request
campaignRouter.post("/create", isAuth, addNewCampaign);

//get request
campaignRouter.get("/brandCampaign/:brandId", getAllCampaignListByBrandId);
campaignRouter.get("/campaignLogs", getCampaignLogs);
campaignRouter.get("/:id/screen", getCampaignListByScreenId);
campaignRouter.get("/:id/screen/all", getAllCampaignListByScreenId);
campaignRouter.get("/:name/screenName", getCampaignListByScreenName);
campaignRouter.get("/all", getCampaignList);
campaignRouter.get("/:id", getCampaignDetail);
campaignRouter.get(
  "/:cid/:campaignName",
  getCampaignDetailWithCidAndCampaignName
);
campaignRouter.get(
  "/:id/screen/campaignAndMedia",
  getCampaignAndMediaListByScreenId
);
campaignRouter.get(
  "/filterCampaignByDate/:startValue/:endValue/:userId/:screenId",
  getFilteredCampaignListBydateRange
);
//put request
campaignRouter.put("/:id", updateCampaignById);

//delete request
campaignRouter.delete(
  "/deleteCamapigns/:id",
  deleteCampaignsPermanentlyByUserId
);
campaignRouter.delete("/:id/:status", isAuth, changeCampaignStatus);

export default campaignRouter;
