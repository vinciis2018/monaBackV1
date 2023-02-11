import mongoose from "mongoose";

const creditSchema = new mongoose.Schema(
  {
    name: { type: String, default: "AdCredit" },
    ticker: { type: String, default: "MONAT" },
    owner: { type: mongoose.Types.ObjectId, required: true },
    balances: { type: Map, of: Number },
    registeredGames: [mongoose.Types.ObjectId],
    deregisteredGames: [mongoose.Types.ObjectId],
    incentives: [mongoose.Types.ObjectId],
    mint: [mongoose.Types.ObjectId],
    stakes: [mongoose.Types.ObjectId],
  },
  {
    timestamps: true,
  }
);

const Credit = mongoose.model("Credit", creditSchema);
export default Credit;