import mongoose from "mongoose";
import checkError from "../helpers/checkError.js";
import CustomError from "../helpers/customError.js";
import CreditLog, { MethodEnum } from "../models/creditLogModel.js";
import Credit from "../models/creditModel.js";
import Wallet from "../models/walletModel.js";

export async function walletDetailHandler(req, res, next) {
  try {
    // const wallet = await Credit.findOne({ owner: req.user._id });
    const adCredits = await Credit.findOne({
      owner: 'jn1prgQsmlicd1w66SOVcMG4GYODjx7zkBNIAzGR3WQ'
    });

    console.log(req.user.defaultWallet)
    if (!adCredits) {
      const createAdCredits = new Credit({
        _id: new mongoose.Types.ObjectId(),
        owner: 'jn1prgQsmlicd1w66SOVcMG4GYODjx7zkBNIAzGR3WQ',
        balances: {
          'jn1prgQsmlicd1w66SOVcMG4GYODjx7zkBNIAzGR3WQ': 990000000,
        },

      })
      console.log(createAdCredits);
      createAdCredits.save();
    }
    const balances = adCredits.balances
    const userBalance = balances[req.user.defaultWallet]

    if (!userBalance) {
      adCredits.balances[req.user.defaultWallet] = 0
      adCredits.save();
    }

    const wallet = await Wallet.findOne({
      walletAddAr: req.user.defaultWallet
    });

    if (!wallet) {
      throw new CustomError("Bad Request", 404, "No such wallet found");
    }
    return res.status(200).send({ walletId: wallet._id, balances: adCredits.balances[req.user.defaultWallet] });
  } catch (err) {
    console.log(err)
    return res.status(404).send(err);
  }
}

export async function walletLogHandler(req, res, next) {
  try {
    const walletLog = await CreditLog.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.send(walletLog);
  } catch (err) {
    checkError(err, res);
  }
}

export async function walletSingleLogHandler(req, res, next) {
  try {
    const walletLog = await CreditLog.findOne({
      owner: req.user._id,
      _id: req.params.id,
    });
    res.send(walletLog);
  } catch (err) {
    checkError(err, res);
  }
}

export async function subtractWalletHandler(req, res, next) {
  let session;
  session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, reason, address } = req.body;
    if (!amount || !address) {
      throw new CustomError(
        "Bad Request",
        401,
        "Please input your wallet address and amount"
      );
    }
    const wallet = await Credit.findOne({ owner: req.user._id });
    if (!wallet) {
      throw new CustomError("Bad Request", 404, "No such wallet found");
    }
    let balances = Object.fromEntries(wallet.balances);
    console.log("balances", balances, address);
    if (balances[address] != undefined) {
      if (balances[address] > amount) {
        balances[address] -= amount;
      } else {
        throw new CustomError(
          "Bad Request",
          404,
          "this address does not enough money"
        );
      }
    } else {
      throw new CustomError("Bad Request", 404, "No such wallet address found");
    }
    wallet.balances = balances;
    await wallet.save();
    await CreditLog.create({
      walletId: wallet._id,
      walletAddress: address,
      reason,
      amount,
      method: MethodEnum.SUBSTRACT,
      owner: req.user._id,
    });
    await session.commitTransaction();
    res.send(balances);
  } catch (err) {
    await session.abortTransaction();
    checkError(err, res);
  }
}
