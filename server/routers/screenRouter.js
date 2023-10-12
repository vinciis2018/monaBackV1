import express from "express";
import {
  addNewScreen,
  addReview,
  deleteScreenById,
  getPinDetailsByScreenId,
  getScreenDetailsByScreenId,
  getScreenPlayList,
  getScreensList,
  getTopCampaigns,
  updateScreenById,
  syncScreenCodeForApk,
  getScreenDetailsForApk,
  checkScreenPlaylistForApk,
  getScreenLogs,
  addAllyPlea,
  giveAccessToAllyPlea,
  rejectAllayPlea,
  getFilteredScreenList,
  getFilteredScreenListByAudiance,
  getAllScreens,
  getCouponListByScreenId,
  getScreensBySearchQuery,
  camDataHandleScreen,
  genderAgeCamDataHandleScreen,
  impressionCamDataHandleScreen,
  getScreensByUserIds,
  getScreensByScreenIds,
  getScreenCamData,
  getScreensByCampaignIds,
} from "../controllers/screenController.js";
import { isAuth } from "../utils/authUtils.js";
import {
  getQrScanData,
  getScreenData,
  getScreenDataByDate,
  scanQrDataSave,
} from "../controllers/screenDataController.js";

const screenRouter = express.Router();

//post request
screenRouter.post("/", isAuth, addNewScreen);
screenRouter.post("/:id/reviews", isAuth, addReview);
screenRouter.post("/:id/allyPlea/ally", isAuth, addAllyPlea);

//get request
screenRouter.get("/top-medias", getTopCampaigns);
screenRouter.get("/", getScreensList);
screenRouter.get("/getScreens", getScreensBySearchQuery);
screenRouter.get("/getScreensByUserIds", getScreensByUserIds);
screenRouter.get("/getScreensByScreenIds", getScreensByScreenIds);
screenRouter.get("/getScreensByCampaignIds", getScreensByCampaignIds);

screenRouter.get("/couponList/:screenId", getCouponListByScreenId);
screenRouter.get("/:id", getScreenDetailsByScreenId);
screenRouter.get("/:id/pin", getPinDetailsByScreenId);
screenRouter.get("/:id/screenmedias/playlist", getScreenPlayList); // not understand what is its purpose ?
screenRouter.get("/:screenId/screenLogs", getScreenLogs);
screenRouter.get("/getFilterScreenList/:text/:locality", getFilteredScreenList);
screenRouter.get(
  "/getFilteredScreenListByAudiance/:averageDailyFootfall/:averagePurchasePower/:averageAgeGroup/:employmentStatus/:kidsFriendly",
  getFilteredScreenListByAudiance
);
//put request
screenRouter.put("/:id", isAuth, updateScreenById);
screenRouter.put("/:id/allyPlea/master", giveAccessToAllyPlea);
screenRouter.put("/:id/allyPlea/reject", rejectAllayPlea);

//delete request

screenRouter.delete("/:id", isAuth, deleteScreenById);

// android apk related
screenRouter.get("/syncCode/:syncCode", syncScreenCodeForApk);
screenRouter.get("/:name/screenName", getScreenDetailsForApk);
screenRouter.get(
  "/:name/screenName/:time/:currentVideo",
  checkScreenPlaylistForApk
);

// screendata related
screenRouter.get("/screenData/:id", getScreenData);
screenRouter.get(
  "/todayScreenData/:id/pageNumber/:pageNumber",
  getScreenDataByDate
);

// screen qr related
screenRouter.put("/scanqrdata/:screenId", scanQrDataSave);
screenRouter.get("/qrscandata/:screenId", getQrScanData);

screenRouter.get("/get/allScreens", getAllScreens);

// cam related
screenRouter.put("/cam/:screenId", camDataHandleScreen);
screenRouter.put("/genderagecam/:screenId", genderAgeCamDataHandleScreen);
screenRouter.put(
  "/impressionMultiplier/cam/:screenId",
  impressionCamDataHandleScreen
);
screenRouter.get("/getscreencamdata/:screenId", getScreenCamData);

export default screenRouter;
