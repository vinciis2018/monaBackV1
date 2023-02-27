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
} from "../controllers/screenController.js";
import { isAuth } from "../utils/authUtils.js";

const screenRouter = express.Router();

//post request
screenRouter.post("/", isAuth, addNewScreen); //tested
screenRouter.post("/:id/reviews", isAuth, addReview); // tested

//get request
screenRouter.get("/top-medias", getTopCampaigns); //tested
screenRouter.get("/", getScreensList); // tested
screenRouter.get("/:id", getScreenDetailsByScreenId); //tested
screenRouter.get("/:id/pin", getPinDetailsByScreenId); //tested

screenRouter.get("/:id/screenmedias/playlist", getScreenPlayList); // not understand what is its purpose ?

//put request
screenRouter.put("/:id", isAuth, updateScreenById); //tested

//delete request

screenRouter.delete("/:id", isAuth, deleteScreenById); //tested


// android apk related
screenRouter.get("/syncCode/:syncCode", syncScreenCodeForApk);
screenRouter.get("/:name/screenName", getScreenDetailsForApk);
screenRouter.get("/:name/screenName/:time/:currentVideo", checkScreenPlaylistForApk);


export default screenRouter;
