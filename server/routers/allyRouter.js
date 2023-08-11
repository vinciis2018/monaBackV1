import express from "express";
import {
  addNewAlly,
} from "../controllers/allyController.js";
import { isAuth } from "../utils/authUtils.js";

const allyRouter = express.Router();

//post request
allyRouter.post("/", isAuth, addNewAlly); //tested

export default allyRouter;
