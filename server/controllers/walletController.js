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
      const updatedUser = await user.save();
      return res.status(200).send(updatedUser);
    }
    return res.status(200).send(user);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Wallet router error ${error.message}` });
  }
}
export async function arTransfer(reqArTransferWallet) {
  try {
    console.log(reqArTransferWallet.req.body);
    const req = await reqArTransferWallet.req;
    console.log("start now");
    const arweave = await reqArTransferWallet.arweave;
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
  } catch (err) {
    console.log(err);
    return err;
  }
}

export async function koiiTransfer(reqKoiiTransferWallet) {
  console.log(reqKoiiTransferWallet.req.body.walletId);

  const req = reqKoiiTransferWallet.req;
  try {
    const walletId = reqKoiiTransferWallet.req.body.walletId;
    console.log(walletId);

    const callerWallet = await Wallet.findOne({ walletAddAr: walletId });
    console.log(callerWallet);

    const targetWallet = await Wallet.findOne({
      walletAddAr: req.body.toWallet,
    });
    // const targetUser = await User.findOne({wallets[req.body.toWallet]});
    console.log(targetWallet);

    const koiiLiveContractId = reqKoiiTransferWallet.koiiLiveContractId;
    const arweave = reqKoiiTransferWallet.arweave;

    // connecting to koii contract
    const url = "https://mainnet.koii.live/state";
    const resData = await axios.get(url);
    // const resData = await myReadContracts.readKoiiContract
    const koiiData = await resData.data;

    const caller = callerWallet.walletAddAr;
    console.log("caller", caller);

    const input = {
      function: "transfer",
      target: req.body.toWallet,
      qty: Number(req.body.quantity),
    };

    const state = koiiData;
    console.log("2", state.balances.length);

    console.log(state.balances[caller]);
    // const wallet = JSON.parse(fs.readFileSync(
    //   path.join(__dirname, "server/wallet_drive", `key_${caller}.json`)
    // ));
    const wallet = req.body.walletJWK;

    console.log("key", wallet);

    // const txId = await writeInContract({
    //   contractId: koiiLiveContractId,
    //   input: input,
    //   wallet: wallet
    // })

    console.log("txId here", txId);

    if (txId) {
      console.log("start confirmation", txId);

      const result = {
        txId,
      };

      console.log("end confirmation", result);

      await callerWallet.save();
      await targetWallet.save();

      return result;
    } else {
      console.log("transaction failed");
      return { message: "Transaction failed" };
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function ratTransfer(reqRatTransferWallet) {
  const req = reqRatTransferWallet.reqCommand;
  const arweave = reqRatTransferWallet.arweave;
  const ratLiveContractId = reqRatTransferWallet.ratLiveContractId;
  try {
    const walletId = req.body.walletId;
    const callerWallet = await Wallet.findOne({ walletAddAr: walletId });
    const caller = callerWallet.walletAddAr;
    console.log("caller", caller);

    const targetWallet = await Wallet.findOne({
      walletAddAr: req.body.toWallet,
    });
    const target = `${req.body.toWallet.toString()}`;
    console.log("toWallet", target);

    const qty = Number(req.body.quantity);
    const input = {
      function: "transfer",
      target: target,
      qty: qty,
    };
    console.log(input);

    // const wallet = JSON.parse(fs.readFileSync(
    //   path.join(__dirname, "server/wallet_drive", `key_${caller}.json`)
    // ));
    const wallet = req.body.walletJWK;
    console.log("wallet", wallet);

    // const txId = await writeInContract({
    //   contractId: ratLiveContractId, input, wallet
    // });

    console.log("4_2", txId);

    if (txId) {
      const result = {
        txId,
      };
      console.log("end confirmation", result);

      await callerWallet.save();

      await targetWallet.save();

      const resultStatus = await arweave.transactions.getStatus(result.txId);
      console.log("resultStatus", resultStatus);

      return result, resultStatus;
    } else {
      console.log("transaction failed");
      return { message: "Transaction failed" };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

// rat details
export async function ratDetails(req, res) {
  try {
    const data = "use in front end";

    return res.status(200).send(data);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Wallet router error ${error.message}` });
  }
}
