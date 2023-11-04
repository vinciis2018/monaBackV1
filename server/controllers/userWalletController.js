import { Buffer } from "buffer";
import pkg from "crypto-js";
const { SHA256 } = pkg;
import axios from "axios";
import mongoose from "mongoose";
import UserWallet from "../models/userWalletModel.js";
import User from "../models/userModel.js";
import checkError from "../helpers/checkError.js";

export const createNewWallet = async (req, res) => {
  try {
    console.log("Cretae new wallet called!");
    const userId = req.params.id;
    // first check this user present of or
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });
    //if user exist then check user has wallet or not
    const userWallet = await UserWallet.find({ user: userId });
    console.log("userWallet : ", userWallet);
    if (userWallet?.length > 0) {
      return res.status(200).send(userWallet);
    }
    let newUserWallet = new UserWallet({
      user: userId,
      username: user.name,
      transactions: [],
    });
    newUserWallet = await newUserWallet.save();
    console.log("User wallet created successfully : ", newUserWallet);

    // after create user's new wallet, add this id to its user
    user.userWallet = newUserWallet._id;
    await user.save();

    return res.status(201).send(newUserWallet);
  } catch (error) {
    console.log("Error in create new wallet : ", error);
    return res.status(500).send(`Error in createNewWallet : ${error}`);
  }
};

// add tranjection to user

export const addNewTransactionInUserWallet = async (req, res) => {
  try {
    console.log("add new transaction function called!");
    const txId = new mongoose.Types.ObjectId(); //req.query.txId;
    const amount = req.query.amount; // recharge amount
    const date = new Date();
    const userId = req.query.userId;
    const paymentStatus = true;

    const userWallet = await UserWallet.findOne({ user: userId });
    console.log("user Wallet : ", userWallet);
    if (!userWallet)
      return res.status(404).send({ message: "User wallet not found" });
    // if payanet status == true add amont in wallet or increment amount
    if (paymentStatus)
      userWallet.balance = Number(userWallet.balance) + Number(amount);
    const newTransaction = {
      _id: new mongoose.Types.ObjectId(),
      txId: txId,
      txDate: new Date(),
      amount: amount,
      success: paymentStatus, // false -> for not sucess , true for success
    };

    userWallet.transactions.push(newTransaction);
    const transaction = await userWallet.save();

    return res.status(200).send(transaction);
  } catch (error) {
    console.log("Error in add transection : ", error);
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    console.log("all transaction function called!");
    const walletId = req.params.id;
    const userWallet = await UserWallet.findById(walletId);
    if (!userWallet)
      return res.status(404).send({ message: "Wallet not found!" });
    const transactions = userWallet.transactions.reverse();
    console.log("transactions : ", transactions);

    return res.status(200).send(transactions);
  } catch (error) {
    console.log("Error in getAllTransection :", error);
    return res
      .status(500)
      .send({ message: `Error in getAllTransactions : ${error}` });
  }
};

export const getWalletDetails = async (req, res) => {
  try {
    const walletId = req.params.id;
    const userWallet = await UserWallet.findById(walletId, { balance: 1 });
    console.log("userWallet  details : ", userWallet);
    if (!userWallet)
      return res.status(404).send({ message: "Wallet not found!" });
    return res.status(200).send(userWallet);
  } catch (error) {
    console.log("Error in getWalletDetails :", error);
    return res
      .status(500)
      .send({ message: `Error in getWalletDetails : ${error}` });
  }
};

// this function help us to create or open a phone pay payent getway to user with dynamic amount
export const paymentHandler = async (req, res) => {
  try {
    console.log("paymentHandler : called!");
    const PROD_HOST_URL = `https://api.phonepe.com/apis/hermes/pg/v1/pay`;
    const UAT_PAY_API_URL = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay`;

    const amount = parseFloat(req.query.amount) * 100;
    const userId = req.query.userId;
    const transactionId = new mongoose.Types.ObjectId();
    const prodURL = "https://servermonad.vinciis.in";
    const callbackUrl = `${prodURL}/api/userWallet/callbackHandler?userId=${userId}&amount=${amount}&transactionId=${transactionId}`;
    console.log("amount, userId, callbackUrl : ", amount, userId, callbackUrl);
    console.log("process.REACT_MERCHANT_ID : MONADONLINE");

    const payloadForFetch = {
      merchantId: "MONADONLINE",
      merchantTransactionId: transactionId,
      merchantUserId: "MUID123",
      amount: amount,
      redirectUrl: callbackUrl,
      redirectMode: "POST",
      callbackUrl: callbackUrl,
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    let objJsonStr = JSON.stringify(payloadForFetch);
    console.log("payloadForFetch : ", objJsonStr);
    let payload = Buffer.from(objJsonStr).toString("base64");
    // console.log("payload : ", payloadForFetch);
    // console.log("payload : ", objJsonStr);
    console.log("payload : ", payload);
    const salt = process.env.REACT_PHONE_PAY_SALY;
    // console.log("Salt : ", salt);
    const saltIndex = 1;

    /**
     * SHA256(base64 encoded payload + "/pg/v1/refund" + salt key) + ### + salt index
     */

    let url = SHA256(`${payload}/pg/v1/pay${salt}`).toString();
    url = url + "###" + saltIndex;
    console.log("X-VERIFY : ", url);

    const { data } = await axios.post(
      PROD_HOST_URL,
      {
        request: payload, // body
      },
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": url,
        },
      }
    );
    console.log("response data : ", data);
    if (data.success) {
      console.log(
        "response phonepay url : ",
        data?.data?.instrumentResponse?.redirectInfo?.url
      );

      res.send({ url: data?.data?.instrumentResponse?.redirectInfo?.url });
    }
    console.log("Something went wrong");
    res.status(400).send({ message: "Something went wrong" });
  } catch (error) {
    console.log("Error in paymentHandler : ", error);
    res.status(400).send({ message: `Error in paymentHandler ${error}` });
  }
};

export const callbackHandler = async (req, res) => {
  console.log("------------Inside callback handler-----------------");
  console.log("req.query ", req.query);
  console.log(
    "req.body.response , req.body.transactionId , req.headers",
    req.body.response,
    req.body.transactionId,
    req.headers["x-verify"]
  );
  console.log("req.body.code", req.body.code);

  return res.redirect("https://monad.vinciis.in/wallet/payemtSuccess");
  // return res.status(200).send("payment sucessfull");
};

export const xxx = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in xxx :", error);
    return res.status(500).send({ message: `Error in xxx : ${error}` });
  }
};
