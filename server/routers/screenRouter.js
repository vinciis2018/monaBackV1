import express from "express";
import {
  addNewScreen,
  addNewVideoOnScreen,
  addReview,
  deleteScreenById,
  deleteVideoByVideoId,
  getPinDetailsByScreenId,
  getScreenDetailsByScreenId,
  getScreenPlayList,
  getScreensList,
  getTopVideos,
  getVideosListByScreenId,
  getVideosListByScreenName,
  updateScreenById,
} from "../controllers/screenController.js";
import { isAuth } from "../utils/authUtils.js";

const screenRouter = express.Router();

//post request
screenRouter.post("/", isAuth, addNewScreen); //tested
screenRouter.post("/:id/reviews", isAuth, addReview); // tested
screenRouter.post("/:id/uploadVideo", isAuth, addNewVideoOnScreen); // not tested because we are not using

//get request
screenRouter.get("/top-videos", getTopVideos); //tested
screenRouter.get("/", getScreensList); // tested
screenRouter.get("/:id", getScreenDetailsByScreenId); //tested
screenRouter.get("/:id/pin", getPinDetailsByScreenId); //tested
screenRouter.get("/:name/screenName", getVideosListByScreenName); //tested
screenRouter.get("/:id/screenVideos", getVideosListByScreenId); // tested
screenRouter.get("/:id/screenVideos/playlist", getScreenPlayList); // not understand what is its purpose ?

//put request
screenRouter.put("/:id", isAuth, updateScreenById); //tested

//delete request

screenRouter.delete("/:id", isAuth, deleteScreenById); //tested
screenRouter.delete("/:id/deleteVideo", isAuth, deleteVideoByVideoId); //:id -> videoId

export default screenRouter;
