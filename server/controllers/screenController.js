import Screen from "../modles/screenModel.js";
import Video from "../modles/videoModel.js";
import Calender from "../modles/calenderModel.js";
import Pin from "../modles/pinModel.js";
import User from "../modles/userModel.js";
import mongoose from "mongoose";

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

    //create new video for this new screen
    const video = new Video({
      _id: videoId,
      uploader: req.body._id,
      uploaderName: req.body.name,
      description: "Demo screen video",
      brandName: "Vinciis Default Brand",
      reviews: [],
      numReviews: 0,
      views: 0,
      rating: 0,
      likedBy: [],
      flaggedBy: [],
      screen: screenId,
      screenAddress: "address" || req.body.screenAddress,
      districtCity: "district/city" || req.body.districtCity,
      stateUT: "state/UT" || req.body.stateUT,
      country: "country" || req.body.country,
      video:
        "https://ipfs.io/ipfs/QmNubs7ShhWUDcUN2kSmTxp6HvLE4zdz5UnFRKDdF9i1n8",

      title: "Demo_video.mp4",
      thumbnail:
        "https://ipfs.io/ipfs/Qmf1mxa1NMYC2LCUoQabntCJubXjDrXtVn4Jsin8F3cdos",
      viewedBy: [],
      reviews: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("video", video._id);
    const createdScreenVideo = await video.save();

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

      allies: [],
      pleas: [],
      videos: [video],
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

    await user.videos.push(video);
    await user.screens.push(screen);
    await user.save();

    return res.status(200).send({
      message: "Screen & Video Created",
      screen: createdScreen,
      video: createdScreenVideo,
      pin: pinAdded,
      calender: calenderAdded,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).send(error);
  }
}

// top screen videos
export async function getTopVideos(req, res) {
  try {
    console.warn("getTopVideos called");
    const topVideos = await Video.find({
      isMaster: true,
    })
      .sort({ "master.rating": -1 })
      .limit(3);
    res.status(200).send(topVideos);
  } catch (error) {
    console.error(error);
    return res.status(401).send(`screen router error ${error}`);
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
    return res.status(401).send(`screen router error ${error}`);
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
    return res.status(401).send(``);
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
    return res.status(401).send(error);
  }
}

//update screen by screen Id Note :  here we are  updating screen detail as wellas pin details also
export async function updateScreenById(req, res) {
  try {
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
    return res.status(401).send({ message: `screen router error, ${error}` });
  }
}

//delete screen by screen id
export async function deleteScreenById(req, res) {
  try {
    const screen = await Screen.findById(req.params.id);

    if (!screen) return res.status(404).send({ message: "Screeen Not Found" });

    const screenPin = screen.locationPin;
    console.log("screenPin");
    const screenCalender = screen.calender;
    console.log("screenCalender");
    //deleting all videos/capaign from video collection which running on this screen
    screen.videos.map((_id) => {
      Video.findByIdAndRemove(_id);
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
    return res.status(401).send({ message: `screen router error, ${error}` });
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
    return res.status(401).send({ message: `screen router error, ${error}` });
  }
}

// get videos list which running on this screen whose name was given
export async function getVideosListByScreenName(req, res) {
  try {
    const screenName = req.params.name;
    const screen = await Screen.findOne({ name: screenName });
    if (!screen) return res.status(401).send({ message: "Videos not found" });

    const screenVideos = await Video.find({ screen: screen._id });
    const myScreenVideos = screenVideos.filter((video) => {
      video.paidForSlots === true;
      return video;
    });
    //const myScreenVideos = [...paidVideos]; // what is use of this?
    return res.status(200).send(myScreenVideos);
  } catch (error) {
    return res.status(401).send({ message: `screen router error, ${error}` });
  }
}

// get videos list which running on this screen whose id was given
export async function getVideosListByScreenId(req, res) {
  try {
    const screenId = req.params.id;
    const screenVideos = await Video.find({ screen: screenId });
    if (!screenVideos)
      return res.status(401).send({ message: "Videos not found" });
    const myScreenVideos = screenVideos.filter((video) => {
      video.paidForSlots === true;
      return video;
    });

    return res.status(200).send(myScreenVideos);
  } catch (error) {
    return res
      .status(401)
      .send({ message: `screen router error, ${error.message}` });
  }
}
// get playList

export async function getScreenPlayList(req, res) {
  try {
    const screenId = req.params.id;
    let index = 1;
    let eventVideo = []; // =[]; for default value
    const screenVideos = await Video.find({ screen: screenId });
    if (!screenVideos)
      return res.status(401).send({ message: "Videos not found" });

    //create a new array of video url
    const videos = screenVideos.map((video) => video.video);
    console.log("getScreenPlayList videos : ", videos);
    if (videos.length > 0) {
      if (index === videos.length) {
        index = 1;
      } else {
        index = index + 1;
      }
      eventVideo = videos.map((video) => video.video)[index - 1];
      console.log("eventVideo : ", eachVideo);
    }
    return res.status(200).send(eventVideo);
  } catch (error) {
    return res.status(401).send(error.message);
  }
}
// upload screen videos

export async function addNewVideoOnScreen(req, res) {
  try {
    const screenId = req.params.id;
    console.log("from backend", req.params.id);

    if (!screenId)
      return res.status(401).send({ message: "please choose a screen first" });

    const screenVideo = await Screen.findById(screenId);
    console.log("after from backend", screenId);

    const userVideo = await User.findById(req.user._id);

    if (userVideo) {
      const video = new Video({
        title: req.body.title,
        description: req.body.description,
        video: req.body.video,
        // duration: duration,
        thumbnail: req.body.thumbnail,
        uploader: req.user._id,
        screen: req.params.id,
        uploaderName: req.user.name,

        adWorth: req.body.adWorth,
        adBudget: req.body.adBudget,
        expectedViews: req.body.expectedViews,

        hrsToComplete: req.body.hrsToComplete,
      });
      console.log(video);
      const newVideo = await video.save();
      userVideo.videos.push(newVideo._id);
      screenVideo.videos.push(newVideo._id);

      await userVideo.save();
      await screenVideo.save();
      return res.status(200).send(newVideo);
    }
    return res.status(401).send({ message: "user does not exist" });
  } catch (error) {
    return res.status(401).send(error.message);
  }
}

//detele video from video , screen, and users By video id

export async function deleteVideoByVideoId(req, res) {
  try {
    const video = await Video.findById(req.params.id);
    console.log(video._id);

    if (!video) res.status(404).send({ message: "Video not found" });
    const screenId = video.screen._id;
    const uploaderId = video.uploader;

    const videoScreen = await Screen.findById(screenId);
    const videoUploader = await User.findOne({
      _id: uploaderId,
      // defaultWallet: uploaderId
    });

    console.log("yes", video._id);

    videoScreen.videos.remove(video._id);
    const deletedVideoScreen = await videoScreen.save();
    console.log("1", deletedVideoScreen.videos);

    videoUploader.videos.remove(video._id);
    const deletedVideoUploader = await videoUploader.save();
    console.log("2", deletedVideoUploader.videos); // print remaning list of user video after deleting selected video

    const deletedVideo = await video.remove();

    return res.status(200).send({
      message: "Video deleted",
      video: deletedVideo,
      deletedVideoScreen,
      deletedVideoUploader,
    });
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

/*
try {
  } catch (error) {
      return res.status(401).send(error.message);
    }

*/
