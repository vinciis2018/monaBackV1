import CampaignForMultipleScreen from "../models/campaignForMultipleScreenModel.js";
import Media from "../models/mediaModel.js";
import Plea from "../models/pleaModel.js";
import Screen from "../models/screenModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

async function addCampaignPlea({
  user: userInfo,
  campaignData,
  cid,
  campaign,
}) {
  try {
    console.log("addCampaignPlea called! : ", campaignData);
    const screen = await Screen.findById(campaignData?.screen);
    const user = await User.findOne({
      _id: userInfo._id,
    });

    if (!user) return res.status(404).send("No user found");

    const oldPlea = await Plea.findOne({
      screen: screen._id,
      from: user._id,
      reject: false,
    });

    // if plea already present then no need to create a new plea
    console.log(
      "old Plea is present so i am not going to create again new plea: "
    );
    if (oldPlea) return Promise.resolve();

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
      video: `https://ipfs.io/ipfs/${cid}`,
      campaignForMultipleScreen: campaign._id,
    });

    const savedPlea = await plea.save();
    screen.pleas.push(savedPlea);
    user.pleasMade.push(savedPlea);
    await screen.save();
    await user.save();
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addNewCampaignForMultipleScreen(req, res) {
  try {
    console.log("addNewCampaignForMultipleScreen  called : ");
    // const mediaId = req.body.mediaId;
    // const media = await Media.findById(mediaId);
    // if (!media) res.status(404).send({ message: "Media Not Found" });
    const cid = req.body.cid;
    const user = req.body.user;

    const newCampaign = new CampaignForMultipleScreen({
      cid: cid,
      campaignName: req.body.campaignName || "campaign Name",
      ally: user._id,
      additionalInfo: [...req.body.campaignWithScreens],
    });
    const campaign = await newCampaign.save();
    // Creating new ples request for each screen
    for (let campaignData of campaign?.additionalInfo) {
      await addCampaignPlea({ user, campaignData, cid, campaign });
    }
    return res.status(200).send(campaign);
  } catch (error) {
    return res.status(500).send({
      message: `CampaignForMultipleScreen router error ${error.message}`,
    });
  }
}

export async function createCampaignBasedOnAudiancesProfile(req, res) {
  try {
    // console.log("req.body : ", req.body);
    const user = req.body.user;
    const genderPreference = req.body.genderPreference;
    const employmentTypes = req.body.employmentTypes;
    const croudMobability = req.body.croudMobability;
    const screenHighlights = req.body.screenHighlights;
    const location = req.body.cities?.split(",").map((city) => city.trim()); // 'wqw,wq,wqw,qw' => ['wqw','wq',....]
    const startDateAndTime = req.body.startDateAndTime;
    const endDateAndTime = req.body.endDateAndTime;
    const budget = req.body.budget;
    const campaignName = req.body.campaignName;
    const cid = req.body.cid;
    const ageRange = req.body.ageRange;
    const numberOfAudiances = req.body.numberOfAudiances;

    const averageAgeGroupGreaterThen =
      ageRange?.length > 1
        ? {
            "additionalData.footfallClassification.averageAgeGroup.averageStartAge":
              {
                $lte: ageRange[0],
              },
          }
        : {};
    const averageAgeGroupLessThen =
      ageRange?.length > 1
        ? {
            "additionalData.footfallClassification.averageAgeGroup.eaverageEndAgend":
              {
                $gte: ageRange[1],
              },
          }
        : {};
    const employmentStatusFilter =
      employmentTypes?.length > 0
        ? {
            "additionalData.footfallClassification.employmentStatus": {
              $in: employmentTypes,
            },
          }
        : {};
    const highlightsFilter =
      screenHighlights?.length > 0
        ? {
            screenHighlights: {
              $in: screenHighlights,
            },
          }
        : {};
    const locationFilter =
      location?.length > 0
        ? {
            districtCity: {
              $in: location,
            },
          }
        : {};
    const screenAddressFilter =
      location?.length > 0
        ? {
            screenAddress: {
              $in: location,
            },
          }
        : {};

    const croudMobabilityFilter =
      croudMobability?.length > 0
        ? {
            "additionalData.footfallClassification.crowdMobilityType": {
              $in: croudMobability,
            },
          }
        : {};

    // console.log(
    //   "data : ",
    //   averageAgeGroupGreaterThen,
    //   averageAgeGroupLessThen,
    //   employmentStatusFilter,
    //   croudMobabilityFilter,
    //   screenAddressFilter,
    //   highlightsFilter
    // );

    const screens = await Screen.find({
      $or: [screenAddressFilter, locationFilter],
      ...highlightsFilter,
      ...averageAgeGroupGreaterThen,
      ...averageAgeGroupLessThen,
      ...croudMobabilityFilter,
      ...employmentStatusFilter,
    });
    console.log("records founds : ", screens);
    console.log("records founds : ", screens.length);

    if (screens.length === 0) {
      return res.status(404).send({
        message: `No screen found accorging to your filter, 
      Please change your condition and try again!`,
      });
    }

    const averageSlot = (
      budget / screens?.reduce((accum, screen) => accum + screen.rentPerSlot, 0)
    ).toFixed(0);

    const additionalInfo = screens.map((screen) => {
      return {
        startDateAndTime: startDateAndTime,
        endDateAndTime: endDateAndTime,
        totalSlotBooked: averageSlot,
        totalAmount: screen.rentPerSlot * averageSlot,
        screen: screen?._id,
      };
    });

    const newCampaign = new CampaignForMultipleScreen({
      cid: cid,
      campaignName: req.body.campaignName || "campaign Name",
      ally: user._id,
      additionalInfo: additionalInfo,
    });

    const campaign = await newCampaign.save();
    // Creating new ples request for each screen
    for (let campaignData of campaign?.additionalInfo) {
      await addCampaignPlea({ user, campaignData, cid, campaign });
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
