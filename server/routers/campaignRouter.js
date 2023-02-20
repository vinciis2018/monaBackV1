import express from "express";
import { addNewCampaign } from "../controllers/campaignController.js";

import { isAuth } from "../utils/authUtils.js";

const campaignRouter = express.Router();

//post request
campaignRouter.post("/create", isAuth, addNewCampaign);

//get request

//put request

//delete request

export default campaignRouter;
