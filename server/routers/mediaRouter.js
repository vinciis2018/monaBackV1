import express from "express";
import {
  addNewMedia,
  deleteMediaByMediaId,
  getSeed,
  getMediaDetailByMediaId,
  getMediasList,
  updateMediaByMediaId,
} from "../controllers/mediaController.js";

import { isAuth } from "../utils/authUtils.js";

const mediaRouter = express.Router();

//post request
mediaRouter.post("/create",  addNewMedia); // tesed

//get request
mediaRouter.get("/seed", getSeed); // wahi is the use of?
mediaRouter.get("/", getMediasList); //tested
mediaRouter.get("/:id", getMediaDetailByMediaId); // tested

//put request

mediaRouter.put("/:id", isAuth, updateMediaByMediaId); // tested

//delete request
mediaRouter.delete("/:id", isAuth, deleteMediaByMediaId); // tested

export default mediaRouter;
