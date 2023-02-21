import Screen from "../models/screenModel.js";
import Media from "../models/mediaModel.js";
import Calender from "../models/calenderModel.js";
import Pin from "../models/pinModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import Campaign from "../models/campaignModel.js";

//add new screen
export async function addNewScreen(req, res) {
  try {
    const user = await User.findOne({
      _id: req.body._id,
    });
    if (!user)
      res.status(404).send({ message: "User Not Found! DO login again" });
    const calenderId = new mongoose.Types.ObjectId();
    const pinId = new mongoose.Types.ObjectId();
    const videoId = new mongoose.Types.ObjectId();
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
    console.log("calender", calender._id);
    const calenderAdded = await calender.save();

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
    console.log("pin", pin._id);
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
        measurementUnit: req.body.measurementUnit,
      },

      scWorth: req.body.scWorth,
      slotsTimePeriod: req.body.slotsTimePeriod,
      rentPerSlot: req.body.rentPerSlot,
      rentOffInPercent: req.body.rentOffInPercent, //v

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
    });
    console.log(screen._id);
    const createdScreen = await screen.save();

    await user.screens.push(screen);
    await user.save();

    return res.status(200).send({
      message: "Screen Created",
      screen: createdScreen,
      pin: pinAdded,
      calender: calenderAdded,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
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

//get 6 screens details at a time
export async function getScreensList(req, res) {
  try {
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

    res
      .status(200)
      .send({ screens, page, pages: Math.ceil(countDocuments / pageSize) });
  } catch (error) {
    console.error(error);
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
    res.status(200).send(screen);
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
    const screenId = req.params.id;
    const screen = await Screen.findById(screenId);
    if (!screen) res.status(404).send({ message: "Screen Not Found" });
    console.log("req : ", req.body);
    if (JSON.stringify(req.body) === "{}")
      res.status(401).send({ message: "Please give comment and reting" });
    if (screen.reviews.find((review) => review.name === req.user.name)) {
      return res
        .status(400)
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
    const videos = screenCampaign.map((campaign) => campaign.mediaURL);
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
