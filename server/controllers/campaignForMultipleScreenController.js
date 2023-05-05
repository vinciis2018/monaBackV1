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

    // for same campaign and same screen
    const oldPlea = await Plea.findOne({
      screen: screen._id,
      from: user._id,
      reject: false,
      video: campaign.video,
    });
    if (!oldPlea) {
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
      // console.log("After pusing plea on scren  : ", screen);
      // console.log("After pusing plea on user  : ", user);
      return Promise.resolve();
    } else {
      console.log("you are sending same  vretuestideo retuest for same screen");
      return Promise.resolve(
        "you are sending same  vretuestideo retuest for same screen"
      );
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addNewCampaignForMultipleScreen(req, res) {
  try {
    console.log("addNewCampaignForMultipleScreen  called");
    const mediaId = req.body.mediaId;
    const media = await Media.findById(mediaId);
    // console.log("media : ", media);
    if (!media) res.status(404).send({ message: "Media Not Found" });
    const cid = media.media.split("/")[4];
    const user = req.body.user;

    const newCampaign = new CampaignForMultipleScreen({
      video: media.media,
      cid: cid,
      thumbnail: req.body.thumbnail || media.thumbnail,
      campaignScreens: [],
      campaignRequestScreens: req.body.screens,
      campaignName: req.body.campaignName || "campaign Name",
      ally: user._id,
    });
    const campaign = await newCampaign.save();
    // updating screen
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
