import mongoose from "mongoose";

const slotDetailsSchema = new mongoose.Schema(
  {
    slotTimeStart: { type: String },
    slotTimeEnd: { type: String },
    isSlotBooked: { type: Boolean, default: false },
    dataAttached: {
      media: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
      transaction: {},
      duration: { type: Number, default: 20 },
      played: { type: Boolean, default: false },
      downloaded: { type: Boolean, default: false },
      createdOn: { type: String, default: Date.now() },
    },
    paidSlot: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const dayDetailsSchema = new mongoose.Schema({
  date: { type: Date },
  endDate: { type: Date },
  slotsPlayed: [slotDetailsSchema], // always <= slotsUsed
  slotsBooked: [
    {
      numberOfSlots: { type: Number },
      campaignDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
      isSlotBooked: { type: Boolean, default: false },
    },
  ],
} , { timestamps: true }
);


const calenderSchema = new mongoose.Schema(
  {
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    screenName: { type: String },
    slotTP: { type: Number },
    slotDetails: [slotDetailsSchema],
    dayDetails: [dayDetailsSchema],
    activeGameContract: { type: String },
    allGameContracts: [{ type: String }],
    createdOn: { type: String, default: Date.now() },
  },
  {
    timestamps: true,
  }
);

const Calender = mongoose.model("Calender", calenderSchema);

export default Calender;
