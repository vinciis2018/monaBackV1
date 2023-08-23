import express from "express";
import {
  createCreator, editCreator, getAllCreators, getCreatorDetails,
} from "../controllers/creatorController.js";
import { isAuth } from "../utils/authUtils.js";

const creatorRouter = express.Router();

creatorRouter.get("/all", isAuth, getAllCreators);
creatorRouter.get("/details/:id", getCreatorDetails);

//post request
creatorRouter.post("/:id/create", isAuth, createCreator);
creatorRouter.put("/update/:id", isAuth, editCreator);



export default creatorRouter;
