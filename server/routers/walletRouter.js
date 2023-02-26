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
import Credit from "../models/creditModel.js";
import mongoose from "mongoose";

const walletRouter = express.Router();

// get ad adCredits status
walletRouter.get(
  '/adcredit/ad',
  expressAsyncHandler(async (req, res) => {
    const adCredits = await Credit.findOne();
    console.log(req.body)
    if (!adCredits) {
      const createAdCredits = new Credit({
        _id: new mongoose.Types.ObjectId(),
        owner: 'jn1prgQsmlicd1w66SOVcMG4GYODjx7zkBNIAzGR3WQ',
        balances: {
          'jn1prgQsmlicd1w66SOVcMG4GYODjx7zkBNIAzGR3WQ': 990000000,
        },

      })
      console.log(createAdCredits);
    } else {
      console.log(adCredits);
      
    }
    // MongoClient.connect(process.env.DB_URL).then((db) => {
    //   console.log("2")
    //     var dbo = db.db("mongoDB");
    //     console.log("4")

    //     dbo.collection("credits").findOne({}, function(error, result) {
    //       if (error) {
    //         console.log("4_1")
            
    //         return res.status(404).send(error);
    //       } else {
    //         // console.log(result);
    //         return res.status(200).send(result);
    //       }
    //     })
    // })
  })
);

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
