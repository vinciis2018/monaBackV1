import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    txId: { type: mongoose.Schema.Types.ObjectId },
    txDate: { type: String },
    amount: { type: Number },
    success: { type: Boolean, default: false }, // false -> for not sucess , true for success
    aditionalInfo: {},
  },
  { timestamps: true }
);

const walletSchema = new mongoose.Schema(
  {
    walletAddAr: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
    balanceAR: { type: Number, default: 0 }, //Arweave Ar token
    balanceKOII: { type: Number, default: 0 }, //Koii attention token
    balanceRAT: { type: Number, default: 0 }, // Real Attention Token
    balance: { type: Number, default: 0 },
    defaultWallet: { type: Boolean, default: false },
    walletName: { type: String, default: "My Wallet" },
    transactions: [transactionSchema],
  },
  {
    timestamps: true,
  }
);

const UserWallet = mongoose.model("UserWallet", walletSchema);

export default UserWallet;
