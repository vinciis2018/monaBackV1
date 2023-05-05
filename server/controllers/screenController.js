import Screen from "../models/screenModel.js";
import Media from "../models/mediaModel.js";
import Calender from "../models/calenderModel.js";
import Pin from "../models/pinModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import Campaign from "../models/campaignModel.js";
import ScreenLogs from "../models/screenLogsModel.js";
import Randomstring from "randomstring";
import Plea from "../models/pleaModel.js";

// for android APk

const getActiveCampaignList = async (screenId) => {
  try {
    // const updatedCampaigns = await Campaign.updateMany(
    //   {},
    //   {
    //     $set: {
    //       isPause: false,
    //       isDeleted: false,
    //     },
    //   }
    // );
    // console.log("updatedCampaigns : ", updatedCampaigns);
    const screenVideos = await Campaign.find({
      screen: screenId,
      isPause: false,
      remainingSlots: { $gte: 1 },
      isDeleted: false,
      // paidForSlot: true,
    });
    console.log("getActiveCampaignList : ", screenVideos?.length);
    return Promise.resolve(screenVideos);
  } catch (error) {
    return Promise.reject(error);
  }
};

export async function syncScreenCodeForApk(req, res) {
  try {
    const syncCode = req.params.syncCode;
    console.log(syncCode);
    const screen = await Screen.findOne({ screenCode: syncCode });
    console.log(screen);
    const screenVideos = await getActiveCampaignList(screen._id);
    if (screenVideos) {
      const paidVideos = screenVideos.filter(
        (video) => video.status === "Active"
        // console.log(video.status)
        // return video;
      );
      console.log(paidVideos.length);
      const myScreenVideos = [...paidVideos];
      return res.status(200).send({ myScreenVideos, screen });
    } else {
      return res.status(402).send("screen videos not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function getScreenDetailsForApk(req, res) {
  try {
    const screenName = req.params.name;
    console.log(screenName);

    const screen = await Screen.findOne({ name: screenName });
    console.log(screen._id);

    if (screen) {
      const screenVideos = await getActiveCampaignList(screen._id);
      const myScreenVideos = [...screenVideos];
      return res.status(200).send(myScreenVideos);
    } else {
      return res.status(401).send({ message: "Videos not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function checkScreenPlaylistForApk(req, res) {
  try {
    const screenName = req.params.name;
    const time = req.params.time;
    const currentVideo = req.params.currentVideo;
    const deviceInfo = req.query.deviceInfo;
    const playData = {
      deviceInfo: deviceInfo,
      playTime: time,
      playVideo: currentVideo,
    };
    console.log(playData);
    const screen = await Screen.findOne({ name: screenName });
    screen.lastActive = time;
    screen.lastPlayed = currentVideo;

    const campaign = await Campaign.findOne({
      cid: currentVideo.split(".")[0],
      screen: screen._id,
    });
    console.log("campaign  found  checkScreenPlaylistForApk: ", campaign);
    //we are checking, remainingSlots was 1 then change campaign status "Completed" and
    //remove this campaign from screen campaign list
    if (campaign.remainingSlots === 1) {
      console.log(
        "Its time to change campaign status because remainint slot 1 "
      );
      campaign.status = "Completed";
      // removing this campaign from screen.campaigns
      const updatedScreen = await Screen.updateOne(
        { _id: campaign.screen },
        { $pull: { campaigns: campaign._id } }
      );
    }
    campaign.remainingSlots = campaign.remainingSlots - 1;
    const screenLogs = await ScreenLogs.findOne({ screen: screen._id });
    screenLogs.playingDetails.push(playData);
    await screenLogs.save();
    await screen.save();

    await campaign.save();
    const screenVideos = await getActiveCampaignList(screen._id);
    const myScreenVideos = [...screenVideos];
    return res.status(200).send(myScreenVideos);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

//add new screen
export async function addNewScreen(req, res) {
  try {
    const user = await User.findOne({
      _id: req.body._id,
    });
    if (!user) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }
    const calenderId = new mongoose.Types.ObjectId();
    const pinId = new mongoose.Types.ObjectId();
    const screenId = new mongoose.Types.ObjectId();

    // create new calender for this new screen
    const calender = new Calender({
      _id: calenderId,
      screen: screenId,
      screenName: `SCREEN_${req.body.name}_${Date.now()}`,
      slotDetails: [],
      dayDetails: [],
      createdOn: Date.now(),
    });
    console.log("calender", calenderId);
    const calenderAdded = await calender.save();

    const screenLogsAdd = new ScreenLogs({
      _id: new mongoose.Types.ObjectId(),
      screen: screenId,
    });
    await screenLogsAdd.save();
    //create new pin for this new screen
    const pin = new Pin({
      _id: pinId,
      category: "screen",
      screen: screenId,
      image:
        "https://ipfs.io/ipfs/Qmf1mxa1NMYC2LCUoQabntCJubXjDrXtVn4Jsin8F3cdos",
      screenPin: true,
      user: req.body._id,
      lng: 25.26 || req.body.locationPin.lat,
      lat: 82.98 || req.body.locationPin.lng,
    });
    console.log("pin", pinId);
    const pinAdded = await pin.save();

    //now we are going to create new screen
    const screen = new Screen({
      _id: screenId,
      name: "sample name" + Date.now() || req.body.name,
      master: req.body._id,
      masterName: req.body.name,
      image:
        "https://ipfs.io/ipfs/Qmf1mxa1NMYC2LCUoQabntCJubXjDrXtVn4Jsin8F3cdos" ||
        req.body.image,

      screenAddress: "address" || req.body.screenAddress, //v
      districtCity: "district/citvideoy" || req.body.districtCity, //v
      stateUT: "state/UT" || req.body.stateUT, //v
      country: "country" || req.body.country, //v
      screenCode:
        Randomstring.generate({
          length: 6,
        }) || req.body.syncCode,

      category: "INDOORS" || req.body.screenCategory,
      screenType: "TOP_HORIZONTAL" || req.body.screenType,

      rating: 0,
      numReviews: 0,
      description: "sample description" || req.body.description,
      locationPin: pinId,
      lng: 25.26 || req.body.locationPin.lat, //v
      lat: 82.98 || req.body.locationPin.lng, //v
      size: {
        length: 10 || req.body.screenLength,
        width: 5 || req.body.screenWidth,
        measurementUnit: "" || req.body.measurementUnit,
      },

      scWorth: 0 || req.body.scWorth,
      slotsTimePeriod: 0 || req.body.slotsTimePeriod,
      rentPerSlot: 0 || req.body.rentPerSlot,
      rentOffInPercent: 0 || req.body.rentOffInPercent, //v

      campaigns: [],
      allies: [],
      pleas: [],
      subscribers: [],
      likedBy: [],
      flaggedBy: [],
      calender: calender,
      allyUploads: [],
      reviews: [],
      screenTags: ["blinds", "vinciis"],
      screenHighlights: ["blinds", "vinciis"],
      startTime: "" || req.body.startTime,
      endTime: "" || req.body.endTime,
      additionalData: {
        averageDailyFootfall: 0,
        footfallClassification: {
          sexRatio: {
            male: 0,
            female: 0,
          },
          averagePurchasePower: {
            start: 0,
            end: 0,
          },
          regularAudiencePercentage: 0,
          employmentStatus: ["Salried Employees"],
          maritalStatus: ["Unmarried"],
          workType: ["Office"],
          kidsFriendly: "yes",
          crowdMobilityType: ["Walking"],
          averageAgeGroup: {
            averageStartAge: 17,
            averageEndAge: 60,
          },
        },
      },
    });

    // if (screen.screenCode !== "") {
    //   const screenSynced = await Screen.findOne({
    //     screenCode: screen.screenCode,
    //   });

    //   if (screenSynced !== null) {
    //     screen.screenCode
    //   }
    // }
    const createdScreen = await screen.save();
    console.log("createdScreen : ", createdScreen);

    await user.screens.push(screen);
    console.log("user");

    await user.save();

    return res.status(200).send({
      message: "Screen Created",
      screen: createdScreen,
      pin: pinAdded,
      calender: calenderAdded,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
}

// top screen medias
export async function getTopCampaigns(req, res) {
  try {
    console.warn("getTopCampaigns called");
    const topmedias = await Campaign.find({})
      .sort({ "master.rating": -1 })
      .limit(3);
    res.status(200).send(topmedias);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`screen router error ${error}`);
  }
}
// filter screen by name, stateUT, screenAddress, country, districtCity
export async function getFilteredScreenList(req, res) {
  try {
    const searchString = req.params.text.trim();
    console.log("search string : ", searchString);

    const nameFilter = { name: { $regex: searchString, $options: "i" } };
    const screenAddressFilter = {
      screenAddress: { $regex: searchString, $options: "i" },
    };
    const districtCityFilter = {
      districtCity: { $regex: searchString, $options: "i" },
    };
    const stateUTFilter = { stateUT: { $regex: searchString, $options: "i" } };
    const countryFilter = { country: { $regex: searchString, $options: "i" } };
    const category = { category: { $regex: searchString, $options: "i" } };

    const screens = await Screen.find({
      $or: [
        nameFilter,
        screenAddressFilter,
        districtCityFilter,
        stateUTFilter,
        countryFilter,
        category,
      ],
    });
    console.log("records founds : ", screens.length);
    console.log("screens list after filter : ", screens);
    return res.status(200).send(screens);
  } catch (error) {
    return res.status(500).send({ message: `Screen router error ${error}` });
  }
}

//get 6 screens details at a time
export async function getScreensList(req, res) {
  try {
    console.log("getScreensList req.query.pageNumber : ", req.query.pageNumber);
    const pageSize = 6;
    const page = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const category = req.query.category || "";
    const master = req.query.master || "";
    const plea = req.query.plea || "";
    const min =
      req.query.min && Number(req.query.min) !== 0 ? Number(req.query.min) : 0;
    const max =
      req.query.max && Number(req.query.max) !== 0 ? Number(req.query.max) : 0;
    const rating =
      req.query.rating && Number(req.query.rating) !== 0
        ? Number(req.query.rating)
        : 0;

    const nameFilter = name ? { name: { $regex: name, $options: "i" } } : {};
    const masterFilter = master ? { master } : {};
    const categoryFilter = category ? { category } : {};
    const costPerSlotFilter =
      min && max ? { costPerSlot: { $gte: min, $lte: max } } : {};
    const ratingFilter = rating ? { rating: { $gte: rating } } : {};

    const sortPlea =
      plea === "lowest"
        ? { costPerSlot: 1 }
        : plea === "highest"
        ? { costPerSlot: -1 }
        : plea === "toprated"
        ? { rating: -1 }
        : { _id: -1 };

    const countDocuments = await Screen.countDocuments({
      //counting replaced in place of count from amazona tutorial [different from item=count]
      ...masterFilter,
      ...nameFilter,
      ...categoryFilter,
      ...costPerSlotFilter,
      ...ratingFilter,
    });

    const screens = await Screen.find({
      ...masterFilter,
      ...nameFilter,
      ...categoryFilter,
      ...costPerSlotFilter,
      ...ratingFilter,
    })
      .populate("master", "master.name master.logo")
      .sort(sortPlea)
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    // console.log(screens.length);
    return res
      .status(200)
      .send({ screens, page, pages: Math.ceil(countDocuments / pageSize) });
  } catch (error) {
    console.log(error);
    return res.status(500).send(`screen router error ${error}`);
  }
}

//get single screen details By id

export async function getScreenDetailsByScreenId(req, res) {
  try {
    const screen = await Screen.findById(req.params.id).populate(
      "master",
      "master.name master.logo master.rating master.numReviews master.description"
    );
    if (!screen)
      res.status(404).send({ message: "Screen Not Found in Database" });

    const calender = await Calender.findOne({ _id: screen.calender });
    const pin = await Pin.findOne({ screen: screen._id });
    pin.activeGame = calender.activeGameContract;
    pin.image = screen.image;
    pin.save();
    screen.activeGameContract = calender.activeGameContract;
    screen.save();
    const screenLogs = await ScreenLogs.findOne({ screen: screen._id });
    if (!screenLogs) {
      const screenLogsAdd = new ScreenLogs({
        _id: new mongoose.Types.ObjectId(),
        screen: screen._id,
      });
      await screenLogsAdd.save();
    }
    console.log("screen.campaigns : ", screen.campaigns);
    return res.status(200).send(screen);
  } catch (error) {
    return res.status(500).send(``);
  }
}

//get pin details by screen Id
export async function getPinDetailsByScreenId(req, res) {
  try {
    const screen = await Screen.findById(req.params.id).populate();
    if (!screen)
      res.status(404).send({ message: "Screen Not Found in Database" });
    const pinId = screen.locationPin;
    const pin = await Pin.findById(pinId);
    return res.status(200).send(pin);
  } catch (error) {
    return res.status(500).send(error);
  }
}

//update screen by screen Id Note :  here we are  updating screen detail as wellas pin details also
export async function updateScreenById(req, res) {
  try {
    console.log("updateScreenById called!");
    console.log("req.body : ", req.body);
    const screenId = req.params.id;
    const screen = await Screen.findOne({ _id: screenId });
    if (!screen) return res.status(404).send({ message: "Screeen Not Found" });
    const user = await User.findOne({
      _id: screen.master,
    });
    const calender = await Calender.findOne({ screen: screenId });
    const pin = await Pin.findOne({ screen: screenId });

    const masterScreen = user.screens.filter(
      (screen) => screen._id.toString() === screenId
    );

    if (calender && masterScreen) {
      screen.name = req.body.name || screen.name;
      screen.rentPerSlot = req.body.rentPerSlot || screen.rentPerSlot;
      screen.image = req.body.image || screen.image;
      screen.category = req.body.screenCategory || screen.category;
      screen.screenType = req.body.screenType || screen.screenType;
      screen.screenCode = req.body.syncCode || screen.screenCode;

      screen.scWorth = req.body.screenWorth || screen.scWorth;
      screen.slotsTimePeriod =
        req.body.slotsTimePeriod || screen.slotsTimePeriod;
      screen.description = req.body.description || screen.description;
      screen.size.length = req.body.screenLength || screen.size.length;
      screen.size.width = req.body.screenWidth || screen.size.width;
      screen.size.measurementUnit =
        req.body.measurementUnit || screen.size.measurementUnit;
      // we need to change address each video when we chnage address of screen //v
      if (
        req.body.districtCity !== screen.districtCity ||
        req.body.stateUT !== screen.districtCity ||
        req.body.country !== screen.country
      ) {
        console.log("changing campaiign addredd too!");
        screen.campaigns.map(async (_id) => {
          const campaign = await Campaign.findById({ _id });
          console.log("video : 33", campaign);
          campaign.screenAddress =
            req.body.screenAddress || campaign.screenAddress; //v
          campaign.districtCity =
            req.body.districtCity || campaign.districtCity; //v
          campaign.stateUT = req.body.stateUT || campaign.stateUT; //v
          campaign.country = req.body.country || campaign.country; //v
          await campaign.save();
        });
      }
      screen.screenAddress = req.body.screenAddress || screen.screenAddress; //v
      screen.districtCity = req.body.districtCity || screen.districtCity; //v
      screen.stateUT = req.body.stateUT || screen.stateUT; //v
      screen.country = req.body.country || screen.country; //v
      screen.calender = calender._id || screen.calender; // we can change screen calender id ?
      screen.screenTags = req.body.screenTags || screen.screenTags;
      screen.screenHighlights =
        req.body.screenHighlights || screen.screenHighlights;
      screen.lat = req.body.lat || screen.lat; //v
      screen.lng = req.body.lng || screen.lng; //v
      (screen.rentOffInPercent =
        req.body.rentOffInPercent || screen.rentOffInPercent), //v
        (calender.slotTP = req.body.slotsTimePeriod || screen.slotsTimePeriod),
        (calender.screenName = req.body.name || screen.name);

      screen.startTime = req.body.startTime || screen.startTime;
      screen.endTime = req.body.endTime || screen.endTime;
      screen.additionalData = req.body.additionalData || screen.additionalData;
      pin.image = req.body.image || screen.image;
      pin.lat = req.body.lat || pin.lat; //v
      pin.lng = req.body.lng || pin.lng; //v
      //pin.activeGame = req.body.activeGameContract || screen.activeGameContract
      const updatedPin = await pin.save();
      const updatedCalender = await calender.save();
      const updatedScreen = await screen.save();

      return res.status(200).send({
        message: "Screen Updated",
        screen: updatedScreen,
        calender: updatedCalender,
        pin: updatedPin,
      });
    } else {
      return res.status(401).send({
        message: "user is not the master or no pin or calender found",
      });
    }
  } catch (error) {
    return res.status(500).send({ message: `screen router error, ${error}` });
  }
}

//delete screen by screen id (i have work on this latter)
export async function deleteScreenById(req, res) {
  try {
    const screen = await Screen.findById(req.params.id);

    if (!screen) return res.status(404).send({ message: "Screeen Not Found" });

    const screenPin = screen.locationPin;
    console.log("screenPin");
    const screenCalender = screen.calender;
    console.log("screenCalender");
    //deleting all medias/capaign from video collection which running on this screen
    screen.campaigns.map((_id) => {
      Campaign.findByIdAndRemove(_id);
    });
    const deleteScreen = screen.remove();
    const pin = await Pin.findByIdAndRemove(screenPin);
    const calender = await Calender.findByIdAndRemove(screenCalender);

    return res.status(200).send({
      message: "Screen Deleted",
      screen: deleteScreen,
      pin: pin,
      calender: calender,
    });
  } catch (error) {
    return res.status(500).send({ message: `screen router error, ${error}` });
  }
}

//add single review to the Screen
export async function addReview(req, res) {
  try {
    console.log("add review called ! : ", req.body);
    const screenId = req.params.id;
    const screen = await Screen.findById(screenId);
    if (!screen) res.status(404).send({ message: "Screen Not Found" });
    if (JSON.stringify(req.body) === "{}")
      res.status(401).send({ message: "Please give comment and reting" });
    if (screen.reviews.find((review) => review.name === req.user.name)) {
      return res
        .status(401)
        .send({ message: "You already submitted a review" });
    }
    const review = {
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    screen.reviews.push(review);
    screen.numReviews = screen.reviews.length;
    screen.rating =
      screen.reviews.reduce((accum, review) => review.rating + accum, 0) /
      screen.reviews.length;

    const updatedScreen = await screen.save();
    res.status(201).send({
      message: "Review Created",
      review: updatedScreen.reviews[updatedScreen.reviews.length - 1],
    });
  } catch (error) {
    return res.status(500).send({ message: `screen router error, ${error}` });
  }
}

// get playList

export async function getScreenPlayList(req, res) {
  try {
    const screenId = req.params.id;
    let index = 1;
    let eventVideo = []; // =[]; for default value
    const screenCampaign = await Campaign.find({ screen: screenId });
    if (!screenCampaign)
      return res.status(401).send({ message: "Campaigns not found" });

    //create a new array of video url
    const videos = screenCampaign.map((campaign) => campaign.video);
    console.log("getScreenPlayList videos : ", videos);
    if (videos.length > 0) {
      if (index === videos.length) {
        index = 1;
      } else {
        index = index + 1;
      }
      eventVideo = campaignsIdList.map((video) => video.video)[index - 1];
      console.log("eventVideo : ", eachVideo);
    }
    return res.status(200).send(eventVideo);
  } catch (error) {
    return res.status(401).send(error.message);
  }
}

// add screen like

export async function addScreenLikeByScreenId(req, res) {
  try {
    const screenId = req.params.id;
    const interaction = req.params.interaction;
    const screen = await Screen.findById(screenId);
    const user = await User.findOne({
      _id: req.user._id,
    });
    const calender = await Calender.findOne({ screen: screenId });
    const wallet = await Wallet.findOne({ walletAddAr: user.defaultWallet });
    console.log("found it all");

    const walletAddress = wallet.walletAddAr;
    const gameContract = calender.activeGameContract;
    console.log(gameContract);

    if (!gameState.stakes.likeEP || !gameState.stakes.likeEP[walletAddress]) {
      console.log("liking in gameState");
      const reqScreenGamePlayData = {
        req,
        screen,
        calender,
        interaction,
      };
      const Wdash = await screenWorth(screenParams);
      console.log(Wdash);
      const Rdash = await screenSlotRent(screenParams);
      console.log(Rdash);
    }

    return res.status(200).send({
      message: "like game played",
      screen: screen,
    });
  } catch (error) {
    return res.status(401).send(error.message);
  }
}

// get campaign logs by
export async function getScreenLogs(req, res) {
  try {
    console.log("getScreenLogs called! ", req.params.id);
    const screenId = req.params.id;
    const screenLog = await ScreenLogs.findOne({ screen: screenId });
    console.log("screenLogs : ", screenLog);
    res.status(200).send(screenLog.playingDetails);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

// requesting plea from allay
export async function addAllyPlea(req, res) {
  try {
    console.log("addAllyPlea called!");
    const screen = await Screen.findById(req.params.id);
    const user = await User.findOne({
      _id: req.user._id,
      // defaultWallet: req.user.defaultWallet
    });
    const plea = await Plea.findOne({
      screen: screen._id,
      from: user._id,
      reject: false,
    });

    console.log("Plea", plea);
    if (!plea) {
      const plea = new Plea({
        _id: new mongoose.Types.ObjectId(),
        from: user._id,
        to: screen.master,
        screen: screen,
        pleaType: "SCREEN_ALLY_PLEA",
        content: `I would like to request an Ally plea for this ${screen.name} screen`,
        status: false,
        reject: false,
        blackList: false,
        remarks: `${user.name} has requested an Ally plea for ${screen.name} screen`,
      });
      await plea.save();
      console.log("before pusing plea on scren  : ", screen);
      screen.pleas[plea] ? screen.pleas.push(plea) : (screen.pleas = plea);
      console.log("After pusing plea on scren  : ", screen);
      console.log("before pusing plea on user  : ", user);
      user.pleasMade[plea]
        ? user.pleasMade.push(plea)
        : (user.pleasMade = plea);
      console.log("After pusing plea on user  : ", user);
      await screen.save();
      await user.save();
      return res
        .status(200)
        .send({ message: "Ally access plead for screen", plea });
    } else {
      return res
        .status(400)
        .send({ message: "Plea already made, please contact moderators" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Screen router error ${error.message}` });
  }
}

// give ally plea
export async function giveAccessToAllyPlea(req, res) {
  try {
    console.log(req.params.id);
    const plea = await Plea.findOne({ _id: req.params.id });
    console.log(plea);
    const screen = await Screen.findOne({ _id: plea.screen });
    const master = await User.findOne({
      _id: plea.to,
      // defaultWallet: plea.to
    });
    const user = await User.findOne({
      _id: plea.from,
      // defaultWallet: plea.from
    });

    const remark = `${user.name} user has been given an Ally access for ${screen.name} screen from ${master.name} user`;
    // console.log(screen.allies.filter((ally) => ally === user.defaultWallet))
    console.log(user.alliedScreens);
    if (
      screen.allies.filter((ally) => ally === user._id).length === 0 &&
      user.alliedScreens.filter((screen) => screen === screen._id).length === 0
    ) {
      console.log("granting ally access");
      (plea.status = true), plea.remarks.push(remark);
      screen.allies.push(user._id);
      user.alliedScreens.push(screen);

      await screen.save();
      await user.save();
      await plea.save();
      console.log("try {granted access");

      return res.status(200).send(plea);
    } else {
      await plea.remove();
      return res.status(400).send({ message: "ally exist" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

// reject allyPlea
export async function rejectAllayPlea(req, res) {
  try {
    const plea = await Plea.findById(req.params.id);
    const screen = await Screen.findById(plea.screen);
    const master = await User.findOne({
      _id: plea.to,
      // defaultWallet: plea.to
    });
    const user = await User.findOne({
      _id: plea.from,
      // defaultWallet: plea.from
    });
    const remark = `${user.name} user has been rejected an Ally access for ${screen.name} screen from ${master.name} user`;
    if (screen.allies.filter((ally) => ally === user._id).length !== 0) {
      console.log("1");
      screen.allies[useuserr._id].remove();
      user.alliedScreens[screen._id].remove();
      await screen.save();
      await user.save();
    }

    (plea.status = false), (plea.reject = true), plea.remarks.push(remark);
    await plea.save();
    console.log("plea rejected in screen router");

    return res.status(200).send(plea);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}
