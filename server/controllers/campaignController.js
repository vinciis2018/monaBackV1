import Screen from "../models/screenModel.js";
import Campaign from "../models/campaignModel.js";
import Media from "../models/mediaModel.js";
import { sendMoneyBackToAlly } from "../helpers/sendMoney.js";

export async function addNewCampaign(req, res) {
  try {
    console.log("addNewCampaign called! body : ", req.body);
    const user = req.body.user; // ally
    const screenId = req.body.screenId;
    const mediaId = req.body.mediaId;

    const screen = await Screen.findById(screenId);
    if (!screen) res.status(404).send({ message: "Screen Not Found" });
    const media = await Media.findById(mediaId);
    if (!media) res.status(404).send({ message: "Media Not Found" });
    const cid = media.media.split("/")[4];

    const newCampaign = new Campaign({
      screen: screenId,
      media: mediaId,
      cid: cid,
      thumbnail: req.body.thumbnail || media.thumbnail,
      campaignName: req.body.campaignName || "campaign Name",
      video: media.media,
      ally: user._id,
      master: screen.master,
      isSlotBooked: false,
      paidForSlot: false,
      totalSlotBooked: req.body.totalSlotBooked || 0,
      remainingSlots: req.body.totalSlotBooked || 0,
      rentPerSlot: screen.rentPerSlot,
      totalAmount: req.body.totalSlotBooked * screen.rentPerSlot,
      vault: req.body.totalSlotBooked * screen.rentPerSlot,
      allyWalletAddress: user.defaultWallet,

      startDate: req.body.startDate || new Date(),
      endDate: req.body.endDate || new Date(),
      startTime: req.body.startTime || new Date(),
      endTime: req.body.endTime || new Date(),
      isDefaultCampaign: req.body.isDefaultCampaign,
      status: "Active",
      screenAddress: screen.screenAddress,
      districtCity: screen.districtCity,
      stateUT: screen.stateUT,
      country: screen.country,
    });
    const campaign = await newCampaign.save();
    console.log("new campaign created: ", campaign);
    screen.campaigns.push(campaign._id);
    await screen.save();

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
    const campaignList = await Campaign.find({
      $and: [
        { screen: { $eq: screenId } },
        { $or: [{ status: { $eq: "Active" } }, { status: { $eq: "Pause" } }] },
      ],
    });
    if (!campaignList)
      return res.status(401).send({ message: "campaign not found" });

    return res.status(200).send(campaignList);
  } catch (error) {
    return res
      .status(401)
      .send({ message: `campaign router error, ${error.message}` });
  }
}

export async function getAllCampaignListByScreenId(req, res) {
  try {
    const screenId = req.params.id;
    const campaignList = await Campaign.find({
      screen: screenId,
    }).sort({ status: 1 });
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
    const allCampaign = await Campaign.find({ status: { $eq: "Active" } });
    if (allCampaign) {
      return res.status(200).send(allCampaign);
    } else {
      return res.status(404).send({ message: "No campaign found" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `campaign router error ${error.message}` });
  }
}

// change campaign status (Deleted, Pause , Resume)from screen
export async function changeCampaignStatus(req, res) {
  try {
    console.log("changeCampaignStatus called! ");
    const campaignId = req.params.id;
    const campaignStatus = req.params.status;
    const campaign = await Campaign.findById(campaignId);
    //only screen owner can delete campaign
    if (!campaign)
      return res
        .status(400)
        .send("Unauthorize access for deleting this campaign");

    if (campaignStatus === "Deleted") {
      const screen = await Screen.findById(campaign.screen);
      // first we will send sdeleteCampaignend money back to ally wallet and then delete campaign
      if (campaign.remainingSlots > 0) {
        sendMoneyBackToAlly({
          amount: campaign.remainingSlots * campaign.rentPerSlot,
          walletAddress: campaign.allyWalletAddress,
        });
      }
      campaign.status = "Deleted";
      console.log("before deleting campaign from screen : ", screen.campaigns);

      const updatedScreen = await Screen.updateOne(
        { _id: campaign.screen },
        { $pull: { campaigns: campaignId } }
      );
      const updatedCampaign = await campaign.save();
      console.log("After deleting campaign from screen : ", updatedScreen);

      return res.status(200).send(updatedCampaign);
    } else if (campaignStatus === "Pause") {
      if (campaign.isPause) {
        res
          .status(400)
          .send({ message: `Already paused ${campaign.name} campaign` });
      } else {
        campaign.isPause = true;
        campaign.status = "Pause";
        const updatedCampaign = await campaign.save();
        console.log("status chnage to pause :", updatedCampaign);
        res.status(200).send({ message: "Campaign Paused " });
      }
    } else if (campaignStatus === "Resume") {
      if (campaign.isPause) {
        campaign.isPause = false;
        campaign.status = "Active";
        const updatedCampaign = await campaign.save();
        console.log("status chnage to resume :", updatedCampaign.status);
        res.status(200).send({ message: "Campaign Resume " });
      } else {
        res
          .status(400)
          .send({ message: `Already resumed ${campaign.name} campaign` });
      }
    } else {
      return res
        .status(400)
        .send("Unauthorize access for deleting this campaign");
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

//get campaign detail by campaignId

export async function getCampaignDetail(req, res) {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      return res.status(200).send(campaign);
    } else {
      return res.status(404).send({ message: "No campaign found" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

export async function getCampaignAndMediaListByScreenId(req, res) {
  try {
    const screenId = req.params.id;
    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).send({ message: "No Screen found" });
    let data = [];
    //let data = [{media : {}, campaign : {}},{media : {}, campaign : {}}];
    if (screen.campaigns.length > 0) {
      for (let index = 0; index < screen.campaigns.length; index++) {
        const campaignId = screen.campaigns[index];
        let campaign, media;
        campaign = await Campaign.findById(campaignId);
        if (campaign) {
          media = await Media.findById(campaign.media);
        }
        if (campaign && media) {
          data.push({
            media,
            campaign,
          });
        }
      }
      res.status(200).send(data);
    } else {
      return res.status(404).send({ message: "No Screen found", data });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

export async function updateCampaignById(req, res) {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) res.status(404).send({ message: "No Screen found", data });
    campaign.thumbnail =
      "https://ipfs.io/ipfs/Qmf1mxa1NMYC2LCUoQabntCJubXjDrXtVn4Jsin8F3cdos" ||
      req.body.thumbnail;
    const updatededCampaign = await campaign.save();
    return res.status(200).send(updatededCampaign);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

export async function getFilteredCampaignListBydateRange(req, res) {
  try {
    // console.log("filterCampaignByDateRange called! : ");
    // console.log("Start date : ", req.params.startValue);
    // console.log("endDate date : ", req.params.endValue);
    // console.log("screen master  : ", req.params.userId);
    // console.log("screen id  : ", req.params.screenId);

    const campaigns = await Campaign.find({
      startDate: {
        $gte: req.params.startValue,
        $lt: req.params.endValue,
      },
      master: req.params.userId,
      screen: req.params.screenId,
    });

    console.log("filterCampaignByDateRange : ", campaigns?.length);

    return res.status(200).send(campaigns);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}
