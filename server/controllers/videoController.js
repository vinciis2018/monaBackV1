import User from "../modles/userModel.js";
import data from "../utils/data.js";
import Video from "../modles/videoModel.js";
import Screen from "../modles/screenModel.js";

//get seed video data
export async function getSeed(req, res) {
  try {
    const uploader = await User.findOne();
    if (uploader) {
      const videos = data.videos.map((video) => ({
        ...video,
        uploader: uploader._id,
      }));
      const uploadedVideos = await Video.insertMany(videos);
      return res.send({ uploadedVideos });
    } else {
      return res.status(500).send({
        message: "No uploader found. first run /api/users/seed",
      });
    }
  } catch (error) {
    res.status(500).send({ message: `Video router error ${error.message}` });
  }
}

// get all videos list
export async function getVideosList(req, res) {
  try {
    const allVideos = await Video.find();
    if (allVideos) {
      return res.status(200).send(allVideos);
    } else {
      return res.status(404).send({ message: "No video found" });
    }
  } catch (error) {
    res.status(500).send({ message: `Video router error ${error.message}` });
  }
}

//get single video detail by video id
export async function getVideoDetailByVideoId(req, res) {
  try {
    const requestedVideo = await Video.findById(req.params.id);
    if (!requestedVideo)
      return res.status(404).send({ message: "No video found" });
    return res.status(200).send(requestedVideo);
  } catch (error) {
    res.status(500).send({ message: `Video router error ${error.message}` });
  }
}

/* add new video  => for this we require 
req.body = {
    userInfo : {},
     campaign : {},
     advertTags : [].
    totalNoOfSlots :"",
    adWorth,
    adBudget,
    expectedViews,
    hrsToComplete,

 }
*/
// doubt we r sending only  title= ?, advert , thumbnail  from UI
export async function addNewVideo(req, res) {
  try {
    const screenId = req.params.id;
    const videoScreen = await Screen.findById(screenId);
    const videoUser = await User.findOne({
      _id: req.body.userInfo._id,
      // defaultWallet: req.body.campaign.defaultWallet
    });
    const calender = videoScreen.calender;

    if (videoScreen && videoUser) {
      console.log("req.body.campaign.advert : ", req.body.campaign);
      const video = new Video({
        title: req.body.title || "Title here",
        description: req.body.description || "It is video description",
        video:
          req.body.campaign.advert ||
          "https://ipfs.io/ipfs/QmNubs7ShhWUDcUN2kSmTxp6HvLE4zdz5UnFRKDdF9i1n8",
        // duration: duration,
        thumbnail:
          req.body.campaign.thumbnail ||
          "https://ipfs.io/ipfs/Qmf1mxa1NMYC2LCUoQabntCJubXjDrXtVn4Jsin8F3cdos",
        uploader: videoUser._id,
        screen: videoScreen._id,
        uploaderName: videoUser.name,
        // category: req.body.campaign.category,
        brandName: req.body.campaign.title,

        screenAddress: videoScreen.screenAddress, //v
        districtCity: videoScreen.districtCity, //v
        stateUT: videoScreen.stateUT, //v
        country: videoScreen.country, //v
        totalNoOfSlots: req.body.totalNoOfSlots || 0, //v
        adWorth: req.body.adWorth || 0,
        adBudget: req.body.adBudget || 0,
        expectedViews: req.body.expectedViews || 0,
        hrsToComplete: req.body.hrsToComplete || 0,
        calender: calender,
        videoTags: req.body.advertTags || ["blinds", "vinciis", "koii"],
      });

      videoUser.videos.push(video._id);
      await videoUser.save();

      videoScreen.videos.push(video._id);
      await videoScreen.save();
      const newVideo = await video.save();
      console.log("newVideo : ", newVideo);
      console.log("screen video : ", videoScreen);
      console.log("video user ", videoUser);

      return res.status(201).send(newVideo);
    } else {
      return res.status(404).send({ message: "No screen found" });
    }
  } catch (error) {
    res.status(500).send({ message: `Video router error ${error.message}` });
  }
}

//update video by video id
export async function updateVideoByVideoId(req, res) {
  try {
    const video = await Video.findById(req.params.id);
    const videoUser = await User.findOne({
      _id: video.uploader,
    });

    if (video && videoUser) {
      (video.description = req.body.description || video.description),
        (video.title = req.body.title || video.title),
        (video.category = req.body.category || video.category);
      (video.thumbnail = req.body.thumbnail || video.thumbnail),
        (video.video = req.body.advert || video.video);
      (video.adWorth = req.body.adWorth || video.adWorth),
        (video.adBudget = req.body.adBudget || video.adBudget),
        (video.expectedViews = req.body.expectedViews || video.expectedViews),
        (video.hrsToComplete = req.body.hrsToComplete || video.hrsToComplete),
        (video.videoTags = req.body.advertTags || video.videoTags),
        (video.calender = req.body.calender || video.calender),
        (video.brandName = req.body.brandName || video.brandName);

      const updatedVideo = await video.save();
      if (updatedVideo) {
        return res
          .status(200)
          .send({ message: "video updated", video: updatedVideo });
      } else {
        return res.status(401).send({ message: "Video not updated" });
      }
    } else {
      return res.status(401).send({ message: "Video not found" });
    }
  } catch (error) {
    res.status(500).send({ message: `Video router error ${error.message}` });
  }
}

// delete video by video id
export async function deleteVideoByVideoId(req, res) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) res.status(404).send({ message: "Video not found" });

    const screenId = video.screen;
    const uploaderId = video.uploader;

    const videoScreen = await Screen.findById(screenId);
    const videoUploader = await User.findOne({
      _id: uploaderId,
      // defaultWallet: uploaderId
    });
    const deleteVideo = await video.remove();

    if (videoScreen !== undefined || null) {
      videoScreen.videos.remove(video._id);
      await videoScreen.save();
    }

    if (videoUploader !== undefined || null) {
      videoUploader.videos.remove(video._id);
      await videoUploader.save();
    }

    return res.status(200).send({
      message: "Video deleted",
      video: deleteVideo,
      screen: videoScreen,
      user: videoUploader,
    });
  } catch (error) {
    res.status(500).send({ message: `Video router error ${error.message}` });
  }
}
