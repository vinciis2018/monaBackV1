import express from "express";
import {
  AddNewMedia,
  getAllMedia,
  getAllMediaByUserId,
  getMediaByCid,
} from "../controllers/mediaController.js";

import { isAuth } from "../utils/authUtils.js";

const mediaRouter = express.Router();

//post request
mediaRouter.post("/create", isAuth, AddNewMedia); //tested

//get request
mediaRouter.get("/", getAllMedia); // tested
mediaRouter.get("/:cid", getMediaByCid); // tested
mediaRouter.get("/:id/my", getAllMediaByUserId); // tested

//put request

//delete request

export default mediaRouter;
