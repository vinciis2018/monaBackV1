import https from "https";
import checkError from "../helpers/checkError.js";
import CustomError from "../helpers/customError.js";

import mongoose from "mongoose";
import Credit from "../models/creditModel.js";
import CreditLog, { MethodEnum } from "../models/creditLogModel.js";
import { genchecksum, verifychecksum } from "../helpers/checksum.js";

async function paymentHandler(req, res, amount) {
  const orderId = new mongoose.Types.ObjectId();
  var params = {};

  let callbackUrl = `${process.env.HOST_URL}${process.env.PORT}/api/credit/callback/${req.user._id}`;

  params["MID"] = process.env.MERCHANT_ID;
  params["WEBSITE"] = process.env.MERCHANT_WEBSITE;
  params["CHANNEL_ID"] = "WEB";
  params["INDUSTRY_TYPE_ID"] = "Retail";
  params["ORDER_ID"] = orderId.toString();
  params["CUST_ID"] = `${req.user._id}`;
  params["TXN_AMOUNT"] = `${amount}`;
  params["CALLBACK_URL"] = callbackUrl;
  params["EMAIL"] = req.user.email;
  params["MOBILE_NO"] = "8789252448";
  console.log("params", params);
  genchecksum(params, process.env.MERCHANT_KEY, (err, checksum) => {
    if (err) {
      console.log("Error: " + err);
    }

    let paytmParams = {
      ...params,
      CHECKSUMHASH: checksum,
    };
    console.log("webdata", paytmParams);
    res.json(paytmParams);
  });
}

async function callbackHandler(req, res, handlerFunction) {
  let session;
  try {
    let responseData = req.body;
    console.log(responseData);
    session = await mongoose.startSession();
    session.startTransaction();

    console.log("paymentRecieop", responseData);
    var checksumhash = responseData.CHECKSUMHASH;
    var result = verifychecksum(
      responseData,
      process.env.MERCHANT_KEY,
      checksumhash
    );
    if (result) {
      var paytmParams = {};
      paytmParams["MID"] = req.body.MID;
      paytmParams["ORDERID"] = req.body.ORDERID;

      /*
       * Generate checksum by parameters we have
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */
      genchecksum(paytmParams, process.env.MERCHANT_KEY, (err, checksum) => {
        paytmParams["CHECKSUMHASH"] = checksum;

        var post_data = JSON.stringify(paytmParams);

        var options = {
          /* for Production */
          // hostname: "securegw.paytm.in",

          /* for development */
          hostname: "securegw-stage.paytm.in",

          port: 443,
          path: "/order/status",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", async function () {
            let result = JSON.parse(response);
            console.log("result", result);
            if (result.STATUS === "TXN_SUCCESS") {
              //store in db
              const order = await handlerFunction(
                req,
                session,

                parseFloat(result.TXNAMOUNT),
                result.TXNID
              );
              await session.commitTransaction();

              res.redirect(`${process.env.WEB_URL}`);
            } else {
              res.redirect(`${process.env.WEB_URL}`);
            }
          });
        });

        post_req.write(post_data);
        post_req.end();
      });
    } else {
      session.commitTransaction();
      res.redirect(`${process.env.WEB_URL}/failure`);
      console.log("Checksum Mismatched");
    }
  } catch (err) {
    //@ts-ignore
    await session.abortTransaction();
    checkError(err, res);
  }
}

export async function rechargeWalletHandler(req, res) {
  try {
    console.log("body", req.body);
    if (req.body.amount < 20) {
      throw new CustomError(
        "Bad request",
        404,
        "only amount greater than 20 can be recharged"
      );
    }
    await paymentHandler(
      req,
      res,

      Math.ceil(req.body.amount)
    );
  } catch (err) {
    checkError(err, res);
  }
}

export async function rechargeWalletCallbackHandler(req, res) {
  console.log("request", req.body);
  await callbackHandler(req, res, rechargeWalletSuccessHandler);
}

async function rechargeWalletSuccessHandler(req, session, amount) {
  let wallet = await Credit.findOne({ owner: req.params.userId });
  if (wallet) {
    let balances = Object.fromEntries(wallet.balances);
    if (balances[req.params.userId]) {
      balances[req.params.userId] += amount;
    } else {
      balances = { ...balances, [req.params.userId]: amount };
    }
    wallet.balances = balances;
    await wallet.save();
  } else {
    wallet = await Credit.create({
      owner: req.params.userId,
      balances: { [req.params.userId]: amount },
    });
  }
  await CreditLog.create({
    walletId: wallet._id,
    reason: "amount added through payment gateway",
    walletAddress: req.params.userId,
    amount,
    method: MethodEnum.ADD,
    owner: req.params.userId,
  });
}
