import Screen from "../models/screenModel.js";
import Campaign from "../models/campaignModel.js";
import Media from "../models/mediaModel.js";
import { sendMoneyBackToAlly } from "../helpers/sendMoney.js";
import Brand from "../models/brandModel.js";
import User from "../models/userModel.js";

export async function addNewCampaign(req, res) {
  try {
    console.log("addNewCampaign called! body : ");
    const user = req.body.user; // ally
    const screenId = req.body.screenId;
    const mediaId = req.body.mediaId;

    const screen = await Screen.findById(screenId);
    if (!screen) res.status(404).send({ message: "Screen Not Found" });
    const media = await Media.findById(mediaId);
    if (!media) res.status(404).send({ message: "Media Not Found" });
    const cid = media.media.split("/")[4];

    //finding campaign exist or not with same cid and same screen
    const findCampaign = await Campaign.findOne({ cid, screen: screenId });
    if (findCampaign) {
      return res.status(400).send({
        message: "Campaign all ready present with same screen and same video",
      });
    }

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
    console.log("new campaign created successfully!");
    screen.campaigns.push(campaign._id);
    await screen.save();

    return res.status(201).send({
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
    if (!campaignList) {
      return res.status(401).send({ message: "campaign not found" });
    }
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
    if (!campaignList) {
      return res.status(401).send({ message: "campaign not found" });
    }
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
    // console.log("changeCampaignStatus called! ");
    const campaignId = req.params.id;
    const campaignStatus = req.params.status;
    const campaign = await Campaign.findById(campaignId);
    //only screen owner can delete campaign
    if (!campaign) {
      return res
        .status(400)
        .send("Unauthorize access for deleting this campaign");
    }

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

      const updatedScreen = await Screen.updateOne(
        { _id: campaign.screen },
        { $pull: { campaigns: campaignId } }
      );
      const updatedCampaign = await campaign.save();

      return res.status(200).send(updatedCampaign);
    } else if (campaignStatus === "Pause") {
      if (campaign.isPause) {
        return res
          .status(400)
          .send({ message: `Already paused ${campaign.name} campaign` });
      } else {
        campaign.isPause = true;
        campaign.status = "Pause";
        const updatedCampaign = await campaign.save();
        return res.status(200).send({ message: "Campaign Paused " });
      }
    } else if (campaignStatus === "Resume") {
      if (campaign.isPause) {
        campaign.isPause = false;
        campaign.status = "Active";
        const updatedCampaign = await campaign.save();
        res.status(200).send({ message: "Campaign Resume " });
      } else {
        return res
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
      return res.status(200).send(data);
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

    return res.status(200).send(campaigns);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

// get campaign details alogn with all screens with this campaign
export async function getCampaignDetailWithCidAndCampaignName(req, res) {
  try {
    const cid = req.params.cid;
    const campaignName = req.params.campaignName;
    const campaigns = await Campaign.find({ cid, campaignName });

    if (campaigns.length === 0) {
      // console.log("Campaigns not found");
      return res.status(404).send({ message: "Campaigns not found" });
    }

    const results = [];

    for (let eachCampaign of campaigns) {
      const screen = await Screen.findById(eachCampaign.screen);
      results.push({
        campaign: eachCampaign,
        screen: screen,
      });
    }
    return res.status(200).send(results);
  } catch (error) {
    return res.status(500).send({
      message: `Campaign controller error at getCampaignDetailWithScreenList ${error}`,
    });
  }
}

export async function getAllCampaignListByBrandId(req, res) {
  try {
    const brandId = req.params.brandId;
    const brand = await Brand.findOne({ _id: brandId });
    const campaignList = await Campaign.find({
      ally: brand.user,
    });
    if (!campaignList) {
      return res.status(401).send({ message: "campaign not found" });
    }
    return res.status(200).send(campaignList);
  } catch (error) {
    return res
      .status(404)
      .send({ message: `campaign router error, ${error.message}` });
  }
}

export async function deleteCampaignsPermanentlyByUserId(req, res) {
  try {
    const userId = req.params.id || "63f9ca13f179e67ed6c3357b";

    // first check user present or not
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "user not found" });
    }
    // let campaigns = await Campaign.find({ ally: userId });
    // console.log(" before delete camapigns : ", campaigns.length);

    // // direct delete
    // const deletedCampaigns = await Campaign.deleteMany({ ally: userId });
    // console.log("all deleted campaigns : ", deletedCampaigns);

    // campaigns = await Campaign.find({ ally: userId });
    // console.log(" After deletecamapigns : ", campaigns.length);

    //screen wise delete
    // first find all screens of user
    const screens = await Screen.find({ master: userId });
    console.log("screens .length ", screens.length);
    //iterate each screens and delete each campaigns
    for (let screen of screens) {
      let campaigns = screen.campaigns;
      // console.log(`campaigns of ${screen?.name} : ${campaigns}`);
      for (let campaignId of campaigns) {
        const deletdCampaigns = await Campaign.deleteOne({ _id: campaignId });
        // console.log("deleted campaigns : ", deletdCampaigns);
      }
      screen.campaigns = [];
      await screen.save();
      // delete screen also if need else collent that line
    }
    return res
      .status(200)
      .send({ message: "All campaigns deleted successfully!" });
  } catch (error) {
    return res
      .status(404)
      .send({ message: `campaign router error, ${error.message}` });
  }
}
