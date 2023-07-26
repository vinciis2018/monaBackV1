import mongoose from "mongoose";

const screenDataSchema = new mongoose.Schema(
  {
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "screen" },
      // dataType is the type of data to be saved
  // like RAILWAYS_STATUS for station and train status
    dataType: { type: String, default: "RAILWAYS" },
    stationName: { type: String, default: "NEW DELHI" },
    stationCode: { type: String, default: "NDLS" },
    trains: [{
      trainName: { type: String, default: "NEW DELHI SEALDAH EXPRESS" },
      trainCode: { type: String, default: "450343" },
      trainDetails: [{
        actualArrivalDate: { type: Date },
        actualArrivalTime: { type: Date },
        actualDepartureDate: { type: Date },
        actualDepartureTime: { type: Date },
        expectedArrialDate: { type: Date },
        expectedArrivalTime: { type: Date },
        expectedDepartureDate: { type: Date },
        expectedDepartureTime: { type: Date },
        expectedDelay: { type: Number },
        platform: { type: Number },
        from: { type: String },
        to: { type: String },
        via: [{ type: String }],
      }]
    }]
  },
  {
    timestamps: true,
  }
);

const ScreenData = mongoose.model("ScreenData", screenDataSchema);

export default ScreenData;
