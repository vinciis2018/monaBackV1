import mongoose from "mongoose";

const playingDataSchema = new mongoose.Schema(
  {
    deviceInfo: { type: String },
    playTime: { type: Date },
    playVideo: { type: String },
  }, {
    timestamps: true,
  }
);
const screenLogsSchema = new mongoose.Schema(
  {
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    playingDetails: [playingDataSchema]
  },
  {
    timestamps: true,
  }
);

const ScreenLogs = mongoose.model("ScreenLogs", screenLogsSchema);

export default ScreenLogs;
