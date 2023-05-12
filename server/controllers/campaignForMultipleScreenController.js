import CampaignForMultipleScreen from "../models/campaignForMultipleScreenModel.js";
import Media from "../models/mediaModel.js";
import Plea from "../models/pleaModel.js";
import Screen from "../models/screenModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

async function addCampaignPlea({ screenId, user: userInfo, campaign }) {
  try {
    console.log("addCampaignPlea called!");
    const screen = await Screen.findById(screenId);
    const user = await User.findOne({
      _id: userInfo._id,
    });

    const plea = new Plea({
      _id: new mongoose.Types.ObjectId(),
      from: user._id,
      to: screen.master,
      screen: screen._id,
      pleaType: "CAMPAIGN_ALLY_PLEA",
      content: `I would like to request an Campaign plea for this ${screen.name} screen`,
      status: false,
      reject: false,
      blackList: false,
      remarks: `${user.name} has requested an Campaign plea for ${screen.name} screen`,
      video: campaign.video,
      campaignForMultipleScreen: campaign._id,
    });
    const savedPlea = await plea.save();
    screen.pleas.push(plea);
    user.pleasMade.push(plea);
    await screen.save();
    await user.save();

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addNewCampaignForMultipleScreen(req, res) {
  try {
    console.log("addNewCampaignForMultipleScreen  called");
    const mediaId = req.body.mediaId;
    const media = await Media.findById(mediaId);
    if (!media) res.status(404).send({ message: "Media Not Found" });
    const cid = media.media.split("/")[4];
    const user = req.body.user;

    const newCampaign = new CampaignForMultipleScreen({
      video: media.media,
      media: media._id,
      cid: cid,
      thumbnail: req.body.thumbnail || media.thumbnail,
      campaignScreens: [],
      campaignRequestScreens: req.body.screens,
      campaignName: req.body.campaignName || "campaign Name",
      ally: user._id,
      totalSlotBooked: req.body.totalSlotBooked || 0,
      startDate: req.body.startDate || new Date(),
      endDate: req.body.endDate || new Date(),
      startTime: req.body.startTime || new Date(),
      endTime: req.body.endTime || new Date(),
    });
    const campaign = await newCampaign.save();
    console.log("addNewCampaignForMultipleScreen created : ", campaign);
    // Creating new ples request for each screen
    for (let screenId of req.body.screens) {
      await addCampaignPlea({ screenId, user, campaign });
    }
    return res.status(200).send(campaign);
  } catch (error) {
    return res.status(500).send({
      message: `CampaignForMultipleScreen router error ${error.message}`,
    });
  }
}

export async function xxx(req, res) {
  try {
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}
