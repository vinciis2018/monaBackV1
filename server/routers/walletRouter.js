import express from "express";
import expressAsyncHandler from "express-async-handler";
import {
  addNewWallet,
  arTransfer,
  editWallet,
  koiiTransfer,
  ratDetails,
} from "../controllers/walletController.js";
import { isAuth } from "../utils/authUtils.js";

const walletRouter = express.Router();

//post request
walletRouter.post("/walletCreate", isAuth, addNewWallet);
walletRouter.post(
  "/transfer/ar",
  expressAsyncHandler(async (req, res) => {
    try {
      const reqArTransferWallet = {
        req,
      };
      const result = await arTransfer(reqArTransferWallet);
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      return res.status(404).send(error);
    }
  })
);
walletRouter.post(
  "/transfer/koii",
  expressAsyncHandler(async (req, res) => {
    try {
      const reqKoiiTransferWallet = {
        req,
      };
      const result = await koiiTransfer(reqKoiiTransferWallet);
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      return res.status(404).send(error);
    }
  })
);
walletRouter.post(
  "/transfer/rat",
  expressAsyncHandler(async (req, res) => {
    try {
      console.log(req.body);
      const reqCommand = req;
      const reqRatTransferWallet = {
        reqCommand,
      };
      const resultHere = await tokenTransfer.ratTransfer(reqRatTransferWallet);
      console.log(resultHere);
      const result = resultHere.result;
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      return res.status(404).send(error);
    }
  })
);

//get request
walletRouter.get("/rat", ratDetails);

//put request
walletRouter.put("/:id", isAuth, editWallet);

//delete request

export default walletRouter;
