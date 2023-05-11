import express from "express";
import {
  createRewardProgram,
  myCreatedRewardPrograms,
  getRewardProgramDetails,
  editRewardProgram,
} from "../controllers/rewardController.js";
import { isAuth } from "../utils/authUtils.js";

const rewardRouter = express.Router();

//post request
rewardRouter.post("/createReward", isAuth, createRewardProgram); //tested
rewardRouter.get("/myCreatedRewards/:id", myCreatedRewardPrograms);
rewardRouter.get("/reward/:id", getRewardProgramDetails);
rewardRouter.put("/reward/:id", isAuth, editRewardProgram);
export default rewardRouter;
