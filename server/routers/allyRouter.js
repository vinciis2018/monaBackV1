import express from "express";
import {
  addNewScreen,
} from "../controllers/allyController.js";
import { isAuth } from "../utils/authUtils.js";

const allyRouter = express.Router();

//post request
allyRouter.post("/", isAuth, addNewScreen); //tested

export default allyRouter;
