import User from "../models/userModel.js";
import data from "../utils/data.js";
import Media from "../models/mediaModel.js";

//get seed media data
export async function getSeed(req, res) {
  try {
    const uploader = await User.findOne();
    if (uploader) {
      const medias = data.medias.map((media) => ({
        ...media,
        uploader: uploader._id,
      }));
      const uploadedmedias = await Media.insertMany(medias);
      return res.send({ uploadedmedias });
    } else {
      return res.status(500).send({
        message: "No uploader found. first run /api/users/seed",
      });
    }
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}

// get all medias list
export async function getMediasList(req, res) {
  try {
    const allmedias = await Media.find();
    if (allmedias) {
      return res.status(200).send(allmedias);
    } else {
      return res.status(404).send({ message: "No media found" });
    }
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}

//get single media detail by media id
export async function getMediaDetailByMediaId(req, res) {
  try {
    const requestedmedia = await Media.findById(req.params.id);
    if (!requestedmedia)
      return res.status(404).send({ message: "No media found" });
    return res.status(200).send(requestedmedia);
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}

/* add new media  => for this we require 
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
export async function addNewMedia(req, res) {
  try {
    console.log("add new media called!");
    const mediaUser = await User.findOne({
      _id: req.body.userInfo._id,
      // defaultWallet: req.body.campaign.defaultWallet
    });

    if (mediaUser) {
      console.log("req.body.campaign.advert : ", req.body.campaign);
      const media = new Media({
        title: req.body.title || "Title here",
        description: req.body.description || "It is media description",
        media:
          req.body.media ||
          "https://ipfs.io/ipfs/QmNubs7ShhWUDcUN2kSmTxp6HvLE4zdz5UnFRKDdF9i1n8",
        // duration: duration,
        thumbnail:
          req.body.thumbnail ||
          "https://ipfs.io/ipfs/Qmf1mxa1NMYC2LCUoQabntCJubXjDrXtVn4Jsin8F3cdos",
        uploader: mediaUser._id,
        uploaderName: mediaUser.name,
        // category: req.body.campaign.category,
        brandName: req.body.brandName,
        adWorth: req.body.adWorth || 0,
        adBudget: req.body.adBudget || 0,
        expectedViews: req.body.expectedViews || 0,
        hrsToComplete: req.body.hrsToComplete || 0,
        mediaTags: req.body.advertTags || ["blinds", "vinciis", "koii"],
      });
      const newmedia = await media.save();

      mediaUser.medias.push(newmedia._id);
      await mediaUser.save();

      console.log("newmedia : ", newmedia);
      console.log("media user ", mediaUser);

      return res.status(201).send(newmedia);
    } else {
      return res.status(404).send({ message: "No screen found" });
    }
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}

//update media by media id
export async function updateMediaByMediaId(req, res) {
  try {
    const media = await Media.findById(req.params.id);
    const mediaUser = await User.findOne({
      _id: media.uploader,
    });

    if (media && mediaUser) {
      (media.description = req.body.description || media.description),
        (media.title = req.body.title || media.title),
        (media.category = req.body.category || media.category);
      (media.thumbnail = req.body.thumbnail || media.thumbnail),
        (media.media = req.body.advert || media.media);
      (media.adWorth = req.body.adWorth || media.adWorth),
        (media.adBudget = req.body.adBudget || media.adBudget),
        (media.expectedViews = req.body.expectedViews || media.expectedViews),
        (media.hrsToComplete = req.body.hrsToComplete || media.hrsToComplete),
        (media.mediaTags = req.body.advertTags || media.mediaTags),
        (media.calender = req.body.calender || media.calender),
        (media.brandName = req.body.brandName || media.brandName);

      const updatedmedia = await media.save();
      if (updatedmedia) {
        return res
          .status(200)
          .send({ message: "media updated", media: updatedmedia });
      } else {
        return res.status(401).send({ message: "Media not updated" });
      }
    } else {
      return res.status(401).send({ message: "Media not found" });
    }
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}

// delete media by media id
export async function deleteMediaByMediaId(req, res) {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) res.status(404).send({ message: "Media not found" });

    const uploaderId = media.uploader;

    const mediaUploader = await User.findOne({
      _id: uploaderId,
      // defaultWallet: uploaderId
    });
    const deletemedia = await media.remove();

    if (mediaUploader !== undefined || null) {
      mediaUploader.medias.remove(media._id);
      await mediaUploader.save();
    }

    return res.status(200).send({
      message: "Media deleted",
      media: deletemedia,
      user: mediaUploader,
    });
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}
