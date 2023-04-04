import express from "express";
import {
  generateMnemonicFormBip39,
  subtractWalletHandler,
  walletDetailHandler,
  walletLogHandler,
  walletSingleLogHandler,
} from "../controllers/creditController.js";

import {
  rechargeWalletCallbackHandler,
  rechargeWalletHandler,
} from "../controllers/paymentController.js";
import { isAuth } from "../utils/authUtils.js";

const creditRouter = express.Router();

//this route is for adding amount to monad wallet using payment gateway post("/api/credit/add",body:{amount:#someamount})
creditRouter.post("/add", isAuth, rechargeWalletHandler);
creditRouter.post("/generateMnemonic/:id", generateMnemonicFormBip39);
//this route is automatically called by payment gateway
creditRouter.post("/callback/:userId", rechargeWalletCallbackHandler);

//this route gives you details of you wallet {walletId:#walletID,balances:{#addressId:#addressamount}}
creditRouter.get("/details", isAuth, walletDetailHandler);

//this route gives all the logs [{walletId:#walletId,ownerId,reason,createdAt,amount,method,address}]
creditRouter.get("/logs", isAuth, walletLogHandler);

creditRouter.get("/logs/:id", isAuth, walletSingleLogHandler);

//this route is used to substract some amount from wallet from specific address body {amount:#number,address:#this address is found under balances section,reason:#optionnal string}
creditRouter.post("/sub/amount", isAuth, subtractWalletHandler);
export default creditRouter;