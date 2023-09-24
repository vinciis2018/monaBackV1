import {
  CAMPAIGN_STATUS_ACTIVE,
  CAMPAIGN_STATUS_PENDING,
} from "../Constant/campaignStatusConstant.js";
import { CAMPAIGN_ALLY_PLEA } from "../Constant/pleaRequestTypeConstant.js";
import Campaign from "../models/campaignModel.js";
import Plea from "../models/pleaModel.js";
import Screen from "../models/screenModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

async function addCampaignPlea({ user, screen, cid, campaign }) {
  try {
    const oldPlea = await Plea.findOne({
      screen: screen._id,
      from: user._id,
      video: `https://ipfs.io/ipfs/${cid}`,
      reject: false,
    });

    if (oldPlea) {
      // console.log(
      //   "old Plea is present so i am not going to create again new plea: "
      // );
      return Promise.resolve();
    }

    const fromUser = await User.findById(user._id);

    // if plea already present then no need to create a new plea

    const plea = new Plea({
      _id: new mongoose.Types.ObjectId(),
      from: user._id,
      to: screen.master,
      screen: screen._id,
      pleaType: CAMPAIGN_ALLY_PLEA,
      content: `I would like to request an Campaign plea for this ${screen.name} screen`,
      status: false,
      reject: false,
      blackList: false,
      remarks: `${user.name} has requested an Campaign plea for ${screen.name} screen`,
      video: `https://ipfs.io/ipfs/${cid}`,
      campaign: campaign._id,
    });

    const savedPlea = await plea.save();
    screen.pleas.push(savedPlea);
    fromUser.pleasMade.push(savedPlea);
    await screen.save();
    await fromUser.save();
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addNewCampaignForMultipleScreen(req, res) {
  try {
    console.log("addNewCampaignForMultipleScreen  called : ");

    const cid = req.body.cid;
    const user = req.body.user;
    const media = req.body.media;

    for (let data of req.body.campaignWithScreens) {
      const screenId = data.screen;
      const screen = await Screen.findById(screenId);

      const newCampaign = new Campaign({
        screen: screenId,
        cid: cid,
        media: media._id,
        thumbnail: media.thumbnail,
        campaignName: req.body.campaignName.trim() || "campaign Name",
        video: media.media,
        ally: user._id,
        master: screen.master,
        isSlotBooked: false,
        paidForSlot: false,
        totalSlotBooked: Number(data.totalSlotBooked) || 0,
        remainingSlots: data.totalSlotBooked || 0,
        rentPerSlot: screen.rentPerSlot,
        totalAmount: Number(data.totalSlotBooked) * screen.rentPerSlot,
        vault: Number(data.totalSlotBooked) * screen.rentPerSlot,
        allyWalletAddress: user.defaultWallet,

        startDate: data.startDateAndTime || new Date(),
        endDate: data.endDateAndTime || new Date(),
        startTime: data.startDateAndTime || new Date(),
        endTime: data.endDateAndTime || new Date(),
        isDefaultCampaign: data.isDefaultCampaign || false,
        status:
          screen.master != user._id
            ? CAMPAIGN_STATUS_PENDING
            : CAMPAIGN_STATUS_ACTIVE,
        screenAddress: screen.screenAddress,
        districtCity: screen.districtCity,
        stateUT: screen.stateUT,
        country: screen.country,
      });
      const campaign = await newCampaign.save();
      // console.log("new campaign created successfully!", campaign);
      screen.campaigns.push(campaign._id);
      await screen.save();

      // Now send plea request to screen owner of this screen, if user itself is not screen owner
      if (screen.master != user._id) {
        //send campaign plea to that screen owner
        await addCampaignPlea({ user, screen, cid, campaign });
      }
    }
    return res.status(200).send("Campaigns created successfuly!");
  } catch (error) {
    return res.status(500).send({
      message: `addNewCampaignForMultipleScreen router error ${error.message}`,
    });
  }
}

export async function filterScreensBasedOnAudiancesProfile(req, res) {
  try {
    const genderPreference = req.body.genderPreference;
    const employmentTypes = req.body.employmentTypes;
    const croudMobability = req.body.croudMobability;
    const screenHighlights = req.body.screenHighlights;
    const location = req.body.cities.split(",").map((city) => {
      const str = city.trim().toLowerCase();
      return str.charAt(0).toUpperCase() + str.slice(1);
    }); // note first remove spaces amd convert first cahr is capi
    const ageRange = req.body.ageRange;
    const numberOfAudiances = req.body.numberOfAudiances;

    const screenNameFilter = {
      name: { $not: { $regex: "sample", $options: "i" } },
    };
    const averageAgeGroupFilter =
      ageRange.length > 1
        ? {
            "additionalData.footfallClassification.averageAgeGroup.averageStartAge":
              {
                $gte: ageRange[0],
                $lte: ageRange[1],
              },
          }
        : {};
    const averageDailyFootfallFilter =
      numberOfAudiances > 0
        ? {
            "additionalData.averageDailyFootfall": {
              $gte: numberOfAudiances,
            },
          }
        : {};
    const employmentStatusFilter =
      employmentTypes.length > 0
        ? {
            "additionalData.footfallClassification.employmentStatus": {
              $in: employmentTypes,
            },
          }
        : {};
    const highlightsFilter =
      screenHighlights.length > 0
        ? {
            screenHighlights: {
              $in: screenHighlights,
            },
          }
        : {};
    const locationFilter =
      location.length > 0
        ? {
            districtCity: {
              $in: location,
            },
          }
        : {};
    const screenAddressFilter =
      location.length > 0
        ? {
            screenAddress: {
              $in: location,
            },
          }
        : {};

    const croudMobabilityFilter =
      croudMobability.length > 0
        ? {
            "additionalData.footfallClassification.crowdMobilityType": {
              $in: croudMobability,
            },
          }
        : {};

    console.log(
      "data : ",
      employmentStatusFilter,
      croudMobabilityFilter,
      screenAddressFilter,
      highlightsFilter,
      averageAgeGroupFilter
    );

    let screens = await Screen.find({
      ...screenNameFilter,
      $or: [screenAddressFilter, locationFilter],
      ...highlightsFilter,
      ...averageAgeGroupFilter,
      ...croudMobabilityFilter,
      ...employmentStatusFilter,
    });
    // console.log(
    //   "records founds in filterScreensBasedOnAudiancesProfile: ",
    //   screens.length
    // );
    return res.status(200).send(screens);
  } catch (error) {
    return res.status(500).send({
      message: `filterScreensBasedOnAudiancesProfile router error ${error.message}`,
    });
  }
}

export async function createCampaignBasedOnAudiancesProfile(req, res) {
  try {
    // console.log("req.body : ", req.body);
    const user = req.body.user;
    const media = req.body.media;
    const startDateAndTime = req.body.startDateAndTime;
    const endDateAndTime = req.body.endDateAndTime;
    const budget = req.body.budget;
    const campaignName = req.body.campaignName;
    const cid = req.body.cid;
    const screenIds = req.body.screens;

    if (screenIds.length === 0) {
      return res.status(404).send({
        message: `No screen found accorging to your filter,
      Please change your condition and try again!`,
      });
    }

    let screens = await Screen.find({ _id: { $in: screenIds } });
    // console.log("records founds : ", screens.length);

    const averageSlot = (
      budget / screens.reduce((accum, screen) => accum + screen.rentPerSlot, 0)
    ).toFixed(0);

    for (let screen of screens) {
      const newCampaign = new Campaign({
        screen: screen._id,
        cid: cid,
        media: media._id,
        thumbnail: media.thumbnail,
        campaignName: campaignName.trim() || "campaign Name",
        video: media.media,
        ally: user._id,
        master: screen.master,
        isSlotBooked: false,
        paidForSlot: false,
        totalSlotBooked: Number(averageSlot) || 0,
        remainingSlots: averageSlot || 0,
        rentPerSlot: screen.rentPerSlot,
        totalAmount: Number(averageSlot) * screen.rentPerSlot,
        vault: Number(averageSlot) * screen.rentPerSlot,
        allyWalletAddress: user.defaultWallet,

        startDate: startDateAndTime || new Date(),
        endDate: endDateAndTime || new Date(),
        startTime: startDateAndTime || new Date(),
        endTime: endDateAndTime || new Date(),
        isDefaultCampaign: req.body.isDefaultCampaign || false,
        status: CAMPAIGN_STATUS_PENDING,
        screenAddress: screen.screenAddress,
        districtCity: screen.districtCity,
        stateUT: screen.stateUT,
        country: screen.country,
      });
      const campaign = await newCampaign.save();
      // console.log("new campaign created successfully!", campaign);
      screen.campaigns.push(campaign._id);
      await screen.save();

      // Now send plea request to screen owner of this screen, if user itself is not screen owner
      if (screen.master !== user._id) {
        //send campaign plea to that screen owner
        await addCampaignPlea({ user, screen, cid, campaign });
      }
    }

    return res.status(201).send(`Plea request send on ${screens.length} screens,
       You have to wait for untit screen owner will accepty your plea`);
  } catch (error) {
    console.log("-------error : ", error);
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
