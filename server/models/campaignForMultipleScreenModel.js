import mongoose from "mongoose";
// campaignForMultipleScreen;
const additionalInfo = new mongoose.Schema({
  startDateAndTime: { type: Date },
  endDateAndTime: { type: Date },
  totalSlotBooked: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  screen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Screen",
    default: null,
  },
});
const campaignForMultipleScreenSchema = new mongoose.Schema(
  {
    cid: { type: String, required: true },
    campaignName: { type: String, required: true, default: "campaign name" },
    ally: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // campaign creator
    additionalInfo: [
      {
        startDateAndTime: { type: Date },
        endDateAndTime: { type: Date },
        totalSlotBooked: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        screen: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Screen",
          default: null,
        },
      },
    ],
    acceptedScreens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }],
    rejectedScreens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }],
  },
  {
    timestamps: true,
  }
);

const CampaignForMultipleScreen = mongoose.model(
  "CampaignForMultipleScreen",
  campaignForMultipleScreenSchema
);

export default CampaignForMultipleScreen;
