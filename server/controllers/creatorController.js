import mongoose from "mongoose";

import Reward from "../models/rewardModel.js";
import Creator from "../models/creatorModel.js";
import Campaign from "../models/campaignModel.js";
import User from "../models/userModel.js";

export async function getAllCreators(req, res) {
  try {
    const allCreators = await Creator.find();
    if (!allCreators) return res.status(404).send("No Creators Found!");
    return res.status(200).send(allCreators);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Creator router error ${error.message}` });
  }
}

export async function createCreator(req, res) {
  try {
    // allCreators creates a reward program, which mints reward coupons from user interaction
    const creatorId = new mongoose.Types.ObjectId();
    console.log("createCreator called !");
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).send({ message: "User Not Found! DO login again" });
    }

    if (user.creator.length > 0) {
      const creator = await Creator.findOne({ _id: user.creator[0] });

      return res.status(200).send(creator);
    } else {
      const creator = new Creator({
        _id: creatorId,
        creatorName: "CreatorName" || req.body.creatorName,
        creatorType: "INFLUENCER" || req.body.creatorType, 
        user: user._id,
        socialId: [],
        services: [],
        myMedia: [],
        gigs: [],
        about: "",
        niche: {
          industry: [],
          location: [],
        },
        brandsWorkedWith: [],
        creatorDetails: {
          averageResponseTime: 0,
          expertIn: [],
          achievements: [],
          sampleWorkLinks: [],
        },
        additionalInfo: {},
        reviews: [],
        tags: [],
        ratings: 0
      });

      user.creator.push(creatorId);
      user.isCreator = true;

      await user.save();
      const createdCreator = await creator.save();
      return res.status(200).send(createdCreator);
    }
  } catch (error) {
    console.log("error : ", error);
    return res.status(500).send({ message: `Creator router error ${error.message}` });
  }
}

export async function editCreator(req, res) {
  try {
    // creator creates a reward program, which mints reward coupons from user interaction
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }
    const creator = await Creator.findOne({
      _id: req.params.id,
    });

    //  console.log(user)

    creator.creatorName = req.body.creatorInfo.creatorName;
    await user.save();
    const updatedCreator = await creator.save();

    return res.status(200).send(updatedCreator);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Creator router error ${error.message}` });
  }
}

export async function getCreatorDetails(req, res) {
  try {
    // creator creates a reward program, which mints reward coupons from user interaction
    const creator = await Creator.findById(req.params.id);

    if (!creator) return res.status(404).send("No Creator found!");

    return res.status(200).send(creator);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Creator router error ${error.message}` });
  }
}
