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
} from "../controllers/screenController.js";
import { isAuth } from "../utils/authUtils.js";

const screenRouter = express.Router();

//post request
screenRouter.post("/", isAuth, addNewScreen);
screenRouter.post("/:id/reviews", isAuth, addReview);
screenRouter.post("/:id/allyPlea/ally", isAuth, addAllyPlea);

//get request
screenRouter.get("/top-medias", getTopCampaigns);
screenRouter.get("/", getScreensList);
screenRouter.get("/:id", getScreenDetailsByScreenId);
screenRouter.get("/:id/pin", getPinDetailsByScreenId);

screenRouter.get("/:id/screenmedias/playlist", getScreenPlayList); // not understand what is its purpose ?
screenRouter.get("/:id/screenLogs", getScreenLogs);
screenRouter.get("/getFilterScreenList/:text", getFilteredScreenList);
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

screenRouter.get("/get/allScreens", getAllScreens);

export default screenRouter;
