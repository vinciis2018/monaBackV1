import mongoose from "mongoose";
import Wallet from "../models/walletModel.js";
import User from "../models/userModel.js";

// add new wallet
export async function addNewWallet(req, res) {
  const reqBody = req.body;
  try {
    const user = await User.findById(reqBody.user._id);
    if (user.isItanimulli === true || user.wallets.length < 1) {
      const walletId = new mongoose.Types.ObjectId();

      const result = {
        newWalletAddress: reqBody.defWallet,
      };
      console.log("result createWallet", result);

      const createdWallet = new Wallet({
        _id: walletId,
        user: user._id,
        walletAddAr: result.newWalletAddress,
      });
      await createdWallet.save();
      console.log("createdWallet");

      await user.wallets.push(createdWallet.walletAddAr);
      if (!user.defaultWallet) {
        user.defaultWallet = createdWallet.walletAddAr;
        console.log("defaultWallet");
      }
      await user.save();
      console.log("user saved in db");

      res.status(201).send({
        message: "new wallet created",
        wallet: createdWallet,
      });
    } else {
      console.log("wallet already exists");
      return res.status(400).send({ message: "wallet already exist" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Wallet router error ${error.message}` });
  }
}

// wallet to wallet transaction.

export async function addTransactionFromWalletToWallet(req, res) {
  try {
    console.log("start now");
    const arweave = {};
    const callerWallet = await Wallet.findOne({
      walletAddAr: req.body.walletId,
    });
    console.log(callerWallet.walletAddAr);
    const targetWallet = await Wallet.findOne({
      walletAddAr: req.body.toWallet,
    });
    // const targetUser = await User.findOne({wallets[req.body.toWallet]});
    console.log(targetWallet);

    const caller = callerWallet.walletAddAr;
    console.log("caller", caller);

    // const wallet = JSON.parse(fs.readFileSync(
    //   path.join(__dirname, "server/wallet_drive", `key_${caller}.json`)
    // ));

    const wallet = req.body.walletJWK;

    console.log("key", wallet);

    const tx = await arweave.createTransaction(
      {
        target: req.body.toWallet,
        quantity: arweave.ar.arToWinston(Number(req.body.quantity)),
      },
      wallet
    );

    console.log(tx);

    await arweave.transactions.sign(tx, wallet);
    console.log("signing done", tx);
    await arweave.transactions.post(tx);
    console.log("submitted", tx.id);

    const txId = await tx.id;

    console.log("start confirmation", txId);

    const result = {
      txId,
    };
    console.log("end confirmation", result);

    await callerWallet.save();
    await targetWallet.save();

    return result;
  } catch (error) {
    res.status(500).send({ message: `Wallet router error ${error.message}` });
  }
}

// get all wallets data
export async function getAllWallets(req, res) {
  try {
    const allWallets = await Wallet.find();
    if (!allWallets)
      return res.status(400).send({ message: "No wallets found" });
    return res.status(200).send(allWallets);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Wallet router error ${error.message}` });
  }
}

// edit walletRouter
export async function editWallet(req, res) {
  try {
    console.log("editWallet called!");
    const user = await User.findOne({ _id: req.params.id });
    if (req.body.walletAdd) {
      console.log("adding defaultWallet to user");
      user.wallets.concat(user.defaultWallet);
      user.defaultWallet = req.body.walletAdd;
      await user.save();
    }
    return res.status(200).send(user);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Wallet router error ${error.message}` });
  }
}

// export async function xxx(req, res) {
//   try {
//   } catch (error) {
//     return res
//       .status(500)
//       .send({ message: `Wallet router error ${error.message}` });
//   }
// }
