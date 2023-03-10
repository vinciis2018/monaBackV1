import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    screenCode: { type: String, unique: true, default: "" },
    locationPin: { type: mongoose.Schema.Types.ObjectId, ref: "Pin" } || {
      type: String,
    },
    lat: { type: Number }, //v
    lng: { type: Number }, //v

    screenAddress: { type: String },
    districtCity: { type: String, required: true },
    stateUT: { type: String, required: true },
    country: { type: String, required: true },

    category: { type: String, required: true },
    screenType: { type: String, required: true },
    rating: { type: Number },
    numReviews: { type: Number },
    description: { type: String, required: true },
    reviews: [reviewSchema],

    size: {
      length: { type: Number },
      width: { type: Number },
      measurementUnit: { type: String, default: "PX" },
    },

    calender: { type: mongoose.Schema.Types.ObjectId, ref: "Calender" },
    activeGameContract: { type: String, default: "" },

    scWorth: { type: Number, default: 0 }, //in RAT
    slotsTimePeriod: { type: Number, default: 20 }, //in seconds
    rentPerSlot: { type: Number, default: 0 }, //in RAT
    rentOffInPercent: { type: Number, default: 0 }, //V

    master: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    masterName: { type: String },

    campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],

    subscribers: [{ type: String }],

    likedBy: [{ type: String }],

    flaggedBy: [{ type: String }],

    allies: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pleas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plea" }],

    screenTags: [{ type: String }],
    screenHighlights: [{ type: String }],
    startTime: { type: String },
    endTime: { type: String },
    lastPlayed: { type: String },
    lastActive: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Screen = mongoose.model("Screen", screenSchema);

export default Screen;
