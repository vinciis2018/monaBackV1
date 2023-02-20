import Screen from "../models/screenModel.js";
import Campaign from "../models/campaignModel.js";
import Media from "../models/videoModel.js";

export async function addNewCampaign(req, res) {
  try {
    const user = req.body.user; // ally
    const screenId = req.body.screenId;
    const screen = await Screen.findById(screenId);
    if (!screen) res.status(404).send({ message: "Screen Not Found" });
    const videoId = req.body.videoId;
    const Media = await Media.findById(videoId);
    if (!Media) res.status(404).send({ message: "Media Not Found" });

    const newCampaign = new Campaign({
      screen: screenId,
      Media: videoId,
      ally: user._id,
      master: screen.master,
      isSlotBooked: false,
      paidForSlot: false,
      totalSlotBooked: req.body.totalSlotBooked,
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
    });
    const campaign = await newCampaign.save();
    Media.totalNoOfSlots = req.body.totalSlotBooked;
    await Media.save();
    console.log("Media updated!");
    res.status(201).send({
      message: "Campaign Created successfull",
      campaign,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Media router error ${error.message}` });
  }
}

export async function xxx(req, res) {
  try {
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Media router error ${error.message}` });
  }
}
