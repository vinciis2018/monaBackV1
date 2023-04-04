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
      thumbnail: req.body.thumbnail || media.thumbnail,
      campaignName: req.body.campaignName || "campaign Name",
      video: media.media,
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

      startDate: req.body.startDate,
      endDate: req.body.endDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,

      screenAddress: screen.screenAddress,
      districtCity: screen.districtCity,
      stateUT: screen.stateUT,
      country: screen.country,
    });
    //console.log("new campaign  : ", newCampaign);
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
    const campaignList = await Campaign.find({
      $and: [{ screen: { $eq: screenId } }, { status: { $eq: "Active" } }],
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

// delete campaign from screen
export async function deleteCampaign(req, res) {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    //only screen owner can delete campaign
    if (campaign) {
      // first we will send send money back to ally wallet and then delete campaign
      if (campaign.remainingSlots > 0) {
        sendMoneyBackToAlly({
          amount: campaign.remainingSlots * campaign.rentPerSlot,
          walletAddress: campaign.allyWalletAddress,
        });
      }
      // console.log("before Campaign : ", campaign);
      campaign.status = "Deleted";
      const updatedCampaign = await campaign.save();
      // console.log("Updated Campaign : ", updatedCampaign);
      return res.status(200).send(updatedCampaign);
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
    console.log(" screen : ", screen);
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
        console.log("campaign : ", campaign);
        console.log("media : ", media);
        if (campaign && media) {
          data.push({
            media,
            campaign,
          });
        }
      }
      console.log("data : ", data);
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
    res.status(200).send(updatededCampaign);
    res.status(200).send("each screen updated!");
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}
