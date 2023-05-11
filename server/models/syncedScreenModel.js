import mongoose from "mongoose";

const syncedScreenSchema = new mongoose.Schema(
  {
    syncCode: { type: String },
    deviceId: { type: String },
    deviceIp: { type: String },
    deviceDisplay: { type: String },
    deviceMaac: { type: String },
    createdOn: { type: String },
  },
  {
    timestamps: true,
  }
);

const SyncedScreen = mongoose.model("SyncedScreen", syncedScreenSchema);

export default SyncedScreen;
