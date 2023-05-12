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
      // console.log("result createWallet", result);

      const createdWallet = new Wallet({
        _id: walletId,
        user: user._id,
        walletAddAr: result.newWalletAddress,
      });
      await createdWallet.save();

      await user.wallets.push(createdWallet.walletAddAr);
      if (!user.defaultWallet) {
        user.defaultWallet = createdWallet.walletAddAr;
      }
      await user.save();

      res.status(201).send({
        message: "new wallet created",
        wallet: createdWallet,
      });
    } else {
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
    const arweave = {};
    const callerWallet = await Wallet.findOne({
      walletAddAr: req.body.walletId,
    });
    // console.log(callerWallet.walletAddAr);
    const targetWallet = await Wallet.findOne({
      walletAddAr: req.body.toWallet,
    });
    // const targetUser = await User.findOne({wallets[req.body.toWallet]});

    const caller = callerWallet.walletAddAr;
    // console.log("caller", caller);

    // const wallet = JSON.parse(fs.readFileSync(
    //   path.join(__dirname, "server/wallet_drive", `key_${caller}.json`)
    // ));

    const wallet = req.body.walletJWK;

    // console.log("key", wallet);

    const tx = await arweave.createTransaction(
      {
        target: req.body.toWallet,
        quantity: arweave.ar.arToWinston(Number(req.body.quantity)),
      },
      wallet
    );

    await arweave.transactions.sign(tx, wallet);
    // console.log("signing done", tx);
    await arweave.transactions.post(tx);
    // console.log("submitted", tx.id);

    const txId = await tx.id;

    // console.log("start confirmation", txId);

    const result = {
      txId,
    };
    // console.log("end confirmation", result);

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
    const req = await reqArTransferWallet.req;
    const arweave = await reqArTransferWallet.arweave;
    const callerWallet = await Wallet.findOne({
      walletAddAr: req.body.walletId,
    });
    const targetWallet = await Wallet.findOne({
      walletAddAr: req.body.toWallet,
    });
    // const targetUser = await User.findOne({wallets[req.body.toWallet]});

    const caller = callerWallet.walletAddAr;

    // const wallet = JSON.parse(fs.readFileSync(
    //   path.join(__dirname, "server/wallet_drive", `key_${caller}.json`)
    // ));

    const wallet = req.body.walletJWK;
    const tx = await arweave.createTransaction(
      {
        target: req.body.toWallet,
        quantity: arweave.ar.arToWinston(Number(req.body.quantity)),
      },
      wallet
    );

    await arweave.transactions.sign(tx, wallet);
    await arweave.transactions.post(tx);

    const txId = await tx.id;
    const result = {
      txId,
    };

    await callerWallet.save();
    await targetWallet.save();

    return result;
  } catch (err) {
    return err;
  }
}

export async function koiiTransfer(reqKoiiTransferWallet) {
  const req = reqKoiiTransferWallet.req;
  try {
    const walletId = reqKoiiTransferWallet.req.body.walletId;

    const callerWallet = await Wallet.findOne({ walletAddAr: walletId });

    const targetWallet = await Wallet.findOne({
      walletAddAr: req.body.toWallet,
    });
    // const targetUser = await User.findOne({wallets[req.body.toWallet]});

    const koiiLiveContractId = reqKoiiTransferWallet.koiiLiveContractId;
    const arweave = reqKoiiTransferWallet.arweave;

    // connecting to koii contract
    const url = "https://mainnet.koii.live/state";
    const resData = await axios.get(url);
    // const resData = await myReadContracts.readKoiiContract
    const koiiData = await resData.data;

    const caller = callerWallet.walletAddAr;

    const input = {
      function: "transfer",
      target: req.body.toWallet,
      qty: Number(req.body.quantity),
    };

    const state = koiiData;

    // const wallet = JSON.parse(fs.readFileSync(
    //   path.join(__dirname, "server/wallet_drive", `key_${caller}.json`)
    // ));
    const wallet = req.body.walletJWK;

    // const txId = await writeInContract({
    //   contractId: koiiLiveContractId,
    //   input: input,
    //   wallet: wallet
    // })

    if (txId) {
      // console.log("start confirmation", txId);

      const result = {
        txId,
      };

      // console.log("end confirmation", result);

      await callerWallet.save();
      await targetWallet.save();

      return result;
    } else {
      // console.log("transaction failed");
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
    // console.log("caller", caller);

    const targetWallet = await Wallet.findOne({
      walletAddAr: req.body.toWallet,
    });
    const target = `${req.body.toWallet.toString()}`;
    // console.log("toWallet", target);

    const qty = Number(req.body.quantity);
    const input = {
      function: "transfer",
      target: target,
      qty: qty,
    };

    // const wallet = JSON.parse(fs.readFileSync(
    //   path.join(__dirname, "server/wallet_drive", `key_${caller}.json`)
    // ));
    const wallet = req.body.walletJWK;
    // console.log("wallet", wallet);

    // const txId = await writeInContract({
    //   contractId: ratLiveContractId, input, wallet
    // });

    if (txId) {
      const result = {
        txId,
      };

      await callerWallet.save();

      await targetWallet.save();

      const resultStatus = await arweave.transactions.getStatus(result.txId);
      // console.log("resultStatus", resultStatus);

      return result, resultStatus;
    } else {
      // console.log("transaction failed");
      return { message: "Transaction failed" };
    }
  } catch (error) {
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
