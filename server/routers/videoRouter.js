import express from "express";
import {
  addNewVideo,
  deleteVideoByVideoId,
  getSeed,
  getVideoDetailByVideoId,
  getVideosList,
  updateVideoByVideoId,
} from "../controllers/videoController.js";

import { isAuth } from "../utils/authUtils.js";

const videoRouter = express.Router();

//post request
videoRouter.post("/screen/:id", isAuth, addNewVideo); // tesed

//get request
videoRouter.get("/seed", getSeed); // wahi is the use of?
videoRouter.get("/", getVideosList); //tested
videoRouter.get("/:id", getVideoDetailByVideoId); // tested

//put request

videoRouter.put("/:id", isAuth, updateVideoByVideoId); // tested

//delete request
videoRouter.delete("/:id", isAuth, deleteVideoByVideoId); // tested

export default videoRouter;
