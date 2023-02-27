import mongoose from "mongoose";

const screenLogsSchema = new mongoose.Schema(
  {
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    playingDetails: {}
  },
  {
    timestamps: true,
  }
);

const ScreenLogs = mongoose.model("ScreenLogs", screenLogsSchema);

export default ScreenLogs;
