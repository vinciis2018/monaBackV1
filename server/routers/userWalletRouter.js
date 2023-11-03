import express from "express";
import {
  addNewTransactionInUserWallet,
  createNewWallet,
  getAllTransactions,
  getWalletDetails,
  paymentHandler,
  callbackHandler,
} from "../controllers/userWalletController.js";
const userWalletRouter = express.Router();

// post
userWalletRouter.post("/create/:id", createNewWallet); // tested with postman
userWalletRouter.post("/addTransactions", addNewTransactionInUserWallet); // tested with postman

userWalletRouter.post("/paymentHandler", paymentHandler); // tested with localhost
userWalletRouter.post("/callbackHandler", callbackHandler);

//get
userWalletRouter.get("/walletDetails/:id", getWalletDetails); // tested with postman
userWalletRouter.get("/allTransactions/:id", getAllTransactions); // tested  with postman

export default userWalletRouter;
