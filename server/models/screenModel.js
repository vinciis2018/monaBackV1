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

const additionalDataSchema = new mongoose.Schema({
  averageDailyFootfall: { type: Number },
  footfallClassification: {
    sexRatio: {
      male: { type: Number },
      female: { type: Number },
    },
    employmentStatus: [{ type: String }],
    averagePurchasePower: {
      start: { type: Number },
      end: { type: Number },
    },
    regularAudiencePercentage: { type: Number },
    maritalStatus: [{ type: String }],
    workType: [{ type: String }],
    kidsFriendly: { type: String },
    averageAgeGroup: {
      averageStartAge: { type: Number },
      averageEndAge: { type: Number },
    },
    crowdMobilityType: [{ type: String }],
  },
});

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    images: [{ type: String }],
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
    stationCode: { type: String, default: "" },
    landMark: { type: String },

    category: { type: String, required: true },
    screenType: { type: String, required: true },
    rating: { type: Number },
    numReviews: { type: Number },
    description: { type: String, required: true },
    reviews: [reviewSchema],

    size: {
      length: { type: Number },
      width: { type: Number },
      diagonal: { type: Number },
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
    qrCode: { type: String },

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

    additionalData: additionalDataSchema,
  },
  {
    timestamps: true,
  }
);

const Screen = mongoose.model("Screen", screenSchema);

export default Screen;
