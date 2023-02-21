import Screen from "../models/screenModel.js";
import Campaign from "../models/campaignModel.js";
import Media from "../models/mediaModel.js";
import { sendMoneyBackToAlly } from "../helpers/sendMoney.js";

export async function addNewCampaign(req, res) {
  try {
    console.log("addNewCampaign called!");
    const user = req.body.user; // ally
    const screenId = req.body.screenId;
    const mediaId = req.body.mediaId;
    console.log("media id : ", mediaId);

    const screen = await Screen.findById(screenId);
    console.log("screen  : ", screen);
    if (!screen) res.status(404).send({ message: "Screen Not Found" });
    const media = await Media.findById(mediaId);
    console.log("media : ", media);
    if (!media) res.status(404).send({ message: "Media Not Found" });

    const newCampaign = new Campaign({
      screen: screenId,
      media: mediaId,
      mediaURL: media.media,
      ally: user._id,
      master: screen.master,
      isSlotBooked: false,
      paidForSlot: false,
      totalSlotBooked: req.body.totalSlotBooked,
      remainingSlots: req.body.totalSlotBooked,
      rentPerSlot: screen.rentPerSlot,
      totalAmount: req.body.totalSlotBooked * screen.rentPerSlot,
      vault: req.body.totalSlotBooked * screen.rentPerSlot,
      allyWalletAddress: user.defaultWallet,
      calender: {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      },
      screenAddress: screen.screenAddress,
      districtCity: screen.districtCity,
      stateUT: screen.stateUT,
      country: screen.country,
    });
    console.log("new campaign  : ", newCampaign);
    const campaign = await newCampaign.save();
    console.log("new campaign  : ", campaign);
    screen.campaigns.push(campaign._id);
    await screen.save();

    console.log("Media updated!");
    res.status(201).send({
      message: "Campaign Created successfull",
      campaign,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
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

// getCampaignList By screen id
export async function getCampaignListByScreenId(req, res) {
  try {
    const screenId = req.params.id;
    const campaignList = await Campaign.find({ screen: screenId });
    if (!campaignList)
      return res.status(401).send({ message: "campaign not found" });

    return res.status(200).send(campaignList);
  } catch (error) {
    return res
      .status(401)
      .send({ message: `campaign router error, ${error.message}` });
  }
}

// get campaign list which running on this screen whose name was given
export async function getCampaignListByScreenName(req, res) {
  try {
    const screenName = req.params.name;
    const screen = await Screen.findOne({ name: screenName });
    if (!screen) return res.status(401).send({ message: "campaign not found" });

    const campaignList = await Campaign.find({ screen: screen._id });
    if (!campaignList)
      return res.status(401).send({ message: "campaign not found" });

    return res.status(200).send(campaignList);
  } catch (error) {
    return res.status(500).send({ message: `campaign router error, ${error}` });
  }
}

// get all campaign list
export async function getCampaignList(req, res) {
  try {
    const allCampaign = await Campaign.find({});
    if (allCampaign) {
      return res.status(200).send(allCampaign);
    } else {
      return res.status(404).send({ message: "No campaign found" });
    }
  } catch (error) {
    res.status(500).send({ message: `campaign router error ${error.message}` });
  }
}

// delete campaign from screen
export async function deleteCampaign(req, res) {
  const campaignId = req.params.id;
  const user = req.body.userInfo;
  const campaign = await Campaign.findById(campaignId);

  //only screen owner can delete campaign
  if (campaign && campaign.master === user._id) {
    // first we will send send money back to ally wallet and then delete campaign
    if (campaign && campaign.remainingSlots > 0) {
      sendMoneyBackToAlly({
        amount: campaign.remainingSlots * campaign.rentPerSlot,
        walletAddress: campaign.allyWalletAddress,
      });
    }
    const screen = await Screen.findById(campaign.screen);
    console.log("before deleting campaign from screen  : ", screen);
    screen.campaigns = screen.campaigns.filter((id) => id !== campaignId);
    const updatedeScreen = await screen.save();
    console.log("after deleting campaign from screen  : ", updatedeScreen);
    const deletedcampaign = await campaign.remove();
    console.log("delted campaign : ", deleteCampaign);
  }
}
