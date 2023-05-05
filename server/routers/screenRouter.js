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
} from "../controllers/screenController.js";
import { isAuth } from "../utils/authUtils.js";

const screenRouter = express.Router();

//post request
screenRouter.post("/", isAuth, addNewScreen); //tested
screenRouter.post("/:id/reviews", isAuth, addReview); // tested
screenRouter.post("/:id/allyPlea/ally", isAuth, addAllyPlea);

//get request
screenRouter.get("/top-medias", getTopCampaigns); //tested
screenRouter.get("/", getScreensList); // tested
screenRouter.get("/:id", getScreenDetailsByScreenId); //tested
screenRouter.get("/:id/pin", getPinDetailsByScreenId); //tested

screenRouter.get("/:id/screenmedias/playlist", getScreenPlayList); // not understand what is its purpose ?
screenRouter.get("/:id/screenLogs", getScreenLogs);
screenRouter.get("/getFilterScreenList/:text", getFilteredScreenList);
//put request
screenRouter.put("/:id", isAuth, updateScreenById); //tested
screenRouter.put("/:id/allyPlea/master", giveAccessToAllyPlea);
screenRouter.put("/:id/allyPlea/reject", rejectAllayPlea);

//delete request

screenRouter.delete("/:id", isAuth, deleteScreenById); //tested

// android apk related
screenRouter.get("/syncCode/:syncCode", syncScreenCodeForApk);
screenRouter.get("/:name/screenName", getScreenDetailsForApk);
screenRouter.get(
  "/:name/screenName/:time/:currentVideo",
  checkScreenPlaylistForApk
);

export default screenRouter;
