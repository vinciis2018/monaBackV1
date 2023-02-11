import mongoose from "mongoose";
export const MethodEnum = Object.freeze({ ADD: "add", SUBSTRACT: "substract" });
const creditLogSchema = new mongoose.Schema(
  {
    walletId: { type: mongoose.Types.ObjectId, required: true },
    walletAddress: { type: String, required: true },
    owner: { type: mongoose.Types.ObjectId, required: true },
    reason: { type: String },
    amount: { type: Number, default: 0 },
    method: { type: String, required: true, enum: Object.values(MethodEnum) },
    status: { type: String }, //v pending and success
  },
  {
    timestamps: true,
  }
);

const CreditLog = mongoose.model("CreditLog", creditLogSchema);
export default CreditLog;