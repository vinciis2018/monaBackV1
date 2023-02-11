import express from "express";
import { addNewWallet, editWallet } from "../controllers/walletController.js";
import { isAuth } from "../utils/authUtils.js";

const walletRouter = express.Router();

//post request
walletRouter.post("/walletCreate", isAuth, addNewWallet);

//get request

//put request
walletRouter.put("/:id", isAuth, editWallet);

//delete request

export default walletRouter;
