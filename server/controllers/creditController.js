import { generateMnemonic, mnemonicToSeed } from "bip39";
import mongoose from "mongoose";
import checkError from "../helpers/checkError.js";
import CustomError from "../helpers/customError.js";
import CreditLog, { MethodEnum } from "../models/creditLogModel.js";
import Credit from "../models/creditModel.js";
import Wallet from "../models/walletModel.js";
import * as SolWeb3 from "@solana/web3.js";
import User from "../models/userModel.js";

export async function walletDetailHandler(req, res, next) {
  try {
    // const wallet = await Credit.findOne({ owner: req.user._id });
    const adCredits = await Credit.findOne({
      owner: "jn1prgQsmlicd1w66SOVcMG4GYODjx7zkBNIAzGR3WQ",
    });

    console.log(req.user.defaultWallet);
    if (!adCredits) {
      const createAdCredits = new Credit({
        _id: new mongoose.Types.ObjectId(),
        owner: "jn1prgQsmlicd1w66SOVcMG4GYODjx7zkBNIAzGR3WQ",
        balances: {
          jn1prgQsmlicd1w66SOVcMG4GYODjx7zkBNIAzGR3WQ: 990000000,
        },
      });
      console.log(createAdCredits);
      createAdCredits.save();
    }
    const balances = adCredits.balances;
    const userBalance = balances[req.user.defaultWallet];

    if (!userBalance) {
      adCredits.balances[req.user.defaultWallet] = 0;
      adCredits.save();
    }

    const wallet = await Wallet.findOne({
      walletAddAr: req.user.defaultWallet,
    });

    if (!wallet) {
      throw new CustomError("Bad Request", 404, "No such wallet found");
    }
    return res.status(200).send({
      walletId: wallet._id,
      balances: adCredits.balances[req.user.defaultWallet],
    });
  } catch (err) {
    console.log(err);
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

const createWallet = async (body, user, req, res) => {
  try {
    const walletId = new mongoose.Types.ObjectId();
    const createdWallet = new Wallet({
      _id: walletId,
      user: body._id,
      walletAddAr: body.walletAddress,
    });
    await createdWallet.save();
    console.log("createdWallet");

    await user.wallets.push(createdWallet.walletAddAr);
    if (!user.defaultWallet) {
      user.defaultWallet = createdWallet.walletAddAr;
      console.log("defaultWallet");
    }
    const updatedUser = await user.save();
    console.log("user saved in db", updatedUser);

    return res.status(201).send({
      message: "new wallet created",
      wallet: createdWallet,
      jwk: body.jwk,
      mnemonics: body.mnemonics,
      walletAddress: body.walletAddress,
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Wallet router error ${error.message}` });
  }
};

export async function generateMnemonicFormBip39(req, res) {
  try {
    const Solana = new SolWeb3.Connection(SolWeb3.clusterApiUrl("devnet"));
    let mnemonics = generateMnemonic();
    console.log(mnemonics);
    const seed = await mnemonicToSeed(mnemonics);
    console.log(seed);
    let a = new Uint8Array(seed.toJSON().data.slice(0, 32));
    console.log(a);
    var kp = SolWeb3.Keypair.fromSeed(a);
    console.log(kp);
    console.log(kp.publicKey.toBase58());
    console.log({
      jwk: a,
      mnemonics: mnemonics,
      walletAddress: kp.publicKey.toBase58(),
    });

    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });

    console.log("user : ", user);
    if (user && !user.defaultWallet) {
      createWallet(
        {
          jwk: a,
          mnemonics: mnemonics,
          walletAddress: kp.publicKey.toBase58(),
          _id: userId,
        },
        user,
        req,
        res
      );
    } else {
      console.log("wallet already exists");
      return res.status(400).send({ message: "wallet already exist" });
    }
    // return res.status(201).send({
    //   jwk: a,
    //   mnemonics: mnemonics,
    //   walletAddress: kp.publicKey.toBase58(),
    // });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}
