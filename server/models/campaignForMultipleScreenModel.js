import mongoose from "mongoose";
// campaignForMultipleScreen;
const campaignForMultipleScreenSchema = new mongoose.Schema(
  {
    media: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
    video: { type: String, required: true },
    cid: { type: String, required: true },
    thumbnail: { type: String, required: true },
    acceptedScreens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }], // add scren id when screen owner give permition to user
    campaignRequestScreens: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    ],
    rejectedScreens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }], // add scren id when screen owner reject permition to user
    campaignName: { type: String, required: true, default: "campaign name" },
    ally: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // campaign creator
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
