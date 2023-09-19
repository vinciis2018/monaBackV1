import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import Screen from "../models/screenModel.js";
import Media from "../models/mediaModel.js";
import { generateToken } from "../utils/authUtils.js";
import {
  sendConfirmationEmail,
  sendMailForThankYou,
} from "../utils/sendEmail.js";
import data from "../utils/data.js";
import Campaign from "../models/campaignModel.js";
import CouponRewardOffer from "../models/couponRewardOfferModel.js";
import { ObjectId } from "mongodb";
import Wallet from "../models/walletModel.js";
import mongoose from "mongoose";
import CampaignForMultipleScreen from "../models/campaignForMultipleScreenModel.js";

const changePassword = async (req, res, user) => {
  try {
    user.password = bcrypt.hashSync(req.body.password, 8);
    const updateUser = await user.save();
    return res.status(200).send({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      avatar: updateUser.avatar,
      isItanimulli: updateUser.isItanimulli,
      isMaster: updateUser.isMaster,
      isCreator: updateUser.isCreator,
      creator: updateUser.creator,
      isBrand: updateUser.isBrand,
      brand: updateUser.brand,
      isViewer: updateUser.isViewer,
      defaultWallet: updateUser.defaultWallet,
      wallets: updateUser.wallets,
      screens: updateUser.screens,
      screensSubscribed: updateUser.screensSubscribed,
      screensLiked: updateUser.screensLiked,
      screensFlagged: updateUser.screensFlagged,
      medias: updateUser.medias,
      mediasLiked: updateUser.mediasLiked,
      mediasFlagged: updateUser.mediasFlagged,
      mediasViewed: updateUser.mediasViewed,
      pleasMade: updateUser.pleasMade,
      alliedScreens: updateUser.alliedScreens,
      createdAt: updateUser.createdAt,
      phone: user.phone,
      districtCity: user.districtCity,
      pincode: user.pincode,
      address: user.address,
      stateUt: user.stateUt,
      country: user.country,
      token: generateToken(updateUser),
    });
  } catch (error) {
    return res.status(404).send(error);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (bcrypt.compareSync(oldPassword, user.password)) {
      user.password = bcrypt.hashSync(newPassword, 8);
      const updatedUser = await user.save();
      return res.status(201).send("Password Change");
    } else {
      return res.status(404).send({ message: "Old Password incorrect!" });
    }
  } catch (error) {
    return res.status(404).send(error);
  }
};

export async function userSignUp(req, res) {
  try {
    const requestCameFromURL = `${req.header("Origin")}/`;
    const oldUser = await User.findOne({ email: req.body.email });
    if (oldUser && req.body.password) {
      changePassword(req, res, oldUser);
    }

    if (!oldUser && req.body.password) {
      const user = new User({
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        password: bcrypt.hashSync(req.body.password, 8),
      });
      const createdUser = await user.save();
      console.log("user created  : ", createdUser);

      return res.status(200).send({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        avatar: createdUser.avatar,
        isItanimulli: createdUser.isItanimulli,
        isMaster: createdUser.isMaster,
        isCreator: createdUser.isCreator,
        creator: createdUser.creator,
        isBrand: createdUser.isBrand,
        brand: createdUser.brand,
        isViewer: createdUser.isViewer,
        defaultWallet: createdUser.defaultWallet,
        wallets: createdUser.wallets,
        screens: createdUser.screens,
        screensSubscribed: createdUser.screensSubscribed,
        screensLiked: createdUser.screensLiked,
        screensFlagged: createdUser.screensFlagged,
        medias: createdUser.medias,
        mediasLiked: createdUser.mediasLiked,
        mediasFlagged: createdUser.mediasFlagged,
        mediasViewed: createdUser.mediasViewed,
        pleasMade: createdUser.pleasMade,
        alliedScreens: createdUser.alliedScreens,
        createdAt: createdUser.createdAt,
        phone: user.phone,
        districtCity: user.districtCity,
        pincode: user.pincode,
        address: user.address,
        stateUt: user.stateUt,
        country: user.country,
        token: generateToken(createdUser),
      });
    }
  } catch (error) {
    return res.status(404).send(error);
  }
}
export async function filterUserListByName(req, res) {
  try {
    const searchString = String(req.params.name);
    console.log("name to filter : ", searchString);
    const users = await User.find({
      name: { $regex: searchString, $options: "i" },
    });
    console.log("users founds : ", users);

    return res.status(200).send(users);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `User router error ${error.message}` });
  }
}

export async function getUserInfoById(req, res) {
  try {
    const user = await User.findOne(
      { _id: req.params.id },
      {
        name: 1,
        email: 1,
        phone: 1,
        address: 1,
        districtCity: 1,
        pincode: 1,
        stateUt: 1,
        country: 1,
      }
    );
    if (user) {
      // user.defaultWallet = req.params.walletAddress || user.defaultWallet;
      return res.status(200).send(user);
    } else {
      return res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `User router error ${error.message}` });
  }
}

// send email ti user to set passoword

export async function sendEmailToSetPassword(req, res) {
  try {
    console.log("request came to send email to user ", req.body.email);
    const requestCameFromURL = `${req.header("Origin")}/`;
    //signup,
    //forgetPsssword,

    const email = req.body.email;
    const signup = req.body.signup;
    const forgetPassword = req.body.forgetPsssword;

    const user = await User.findOne({ email });

    if (user && signup) {
      return res
        .status(400)
        .send({ message: "User allready exist, please sign in" });
    } else if (!user && forgetPassword) {
      return res
        .status(400)
        .send({ message: "Your account does not exist, please sign up first" });
    } else {
      sendConfirmationEmail(
        req.body.email,
        req.body.name,
        requestCameFromURL,
        req,
        res
      );
    }
  } catch (error) {
    return res.status(500).send({
      message: `sendEmailToSetPassword controller error ${error.message}`,
    });
  }
}
export async function userSigninWithGoogleLogin(req, res) {
  try {
    const requestCameFromURL = `${req.header("Origin")}/`;
    const email = req.body.email;
    let user = await User.findOne({ email });

    if (!user) {
      // user not exist then create his account
      // console.log("This is new user, Creatating new user!");
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(`12345678`, 8),
        avatar: req.body.avatar,
      });
      user = await newUser.save();
      sendMailForThankYou({
        toEmail: email,
        userName: req.body.name,
        requestCameFromURL,
        password: `12345678`,
      });
    }
    // else {
    //   console.log("This is old user, no need to create new account again!");
    // }

    return res.status(200).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isItanimulli: user.isItanimulli,
      isMaster: user.isMaster,
      isAlly: user.isAlly,
      isBrand: user.isBrand,
      brand: user.brand,
      isViewer: user.isViewer,
      phone: user.phone,
      districtCity: user.districtCity,
      pincode: user.pincode,
      address: user.address,
      stateUt: user.stateUt,
      country: user.country,

      defaultWallet: user.defaultWallet,
      wallets: user.wallets,

      screens: user.screens,
      screensSubscribed: user.screensSubscribed,
      screensLiked: user.screensLiked,
      screensFlagged: user.screensFlagged,
      medias: user.medias,
      mediasLiked: user.mediasLiked,
      mediasFlagged: user.mediasFlagged,
      mediasViewed: user.mediasViewed,

      pleasMade: user.pleasMade,
      alliedScreens: user.alliedScreens,

      createdAt: user.createdAt,
      token: generateToken(user),
    });
  } catch (error) {
    return res.status(500).send({
      message: `User router error userSigninWithGoogleLogin ${error.message}`,
    });
  }
}

export async function userSignin(req, res) {
  try {
    const email = req.body.email ? req.body.email.toLowerCase() : "";
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .send({ message: "New user, please sign up to continue" });
    }

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(200).send({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isItanimulli: user.isItanimulli,
        isMaster: user.isMaster,
        isCreator: user.isCreator,
        creator: user.creator,
        isBrand: user.isBrand,
        brand: user.brand,
        isViewer: user.isViewer,
        phone: user.phone,
        districtCity: user.districtCity,
        pincode: user.pincode,
        address: user.address,
        stateUt: user.stateUt,
        country: user.country,

        defaultWallet: user.defaultWallet,
        wallets: user.wallets,

        screens: user.screens,
        screensSubscribed: user.screensSubscribed,
        screensLiked: user.screensLiked,
        screensFlagged: user.screensFlagged,
        medias: user.medias,
        mediasLiked: user.mediasLiked,
        mediasFlagged: user.mediasFlagged,
        mediasViewed: user.mediasViewed,

        pleasMade: user.pleasMade,
        alliedScreens: user.alliedScreens,

        createdAt: user.createdAt,
        token: generateToken(user),
      });
    } else {
      return res.status(402).send({ message: "password incorrect" });
    }
  } catch (error) {
    return res.status(404).send(error);
  }
}

// get users list
export async function getUsersList(req, res) {
  try {
    const users = await User.find({});
    return res.status(200).send(users);
  } catch (error) {
    return res.status(404).send(error);
  }
}

export async function topCreators(req, res) {
  const topCreators = await User.find({
    isCreator: true,
  })
    .sort({ "creator.rating": -1 })
    .limit(5);
  res.status(200).send(topCreators);
}

export async function topMasters(req, res) {
  const topMasters = await User.find({
    isMaster: true,
  })
    .sort({ "master.rating": -1 })
    .limit(3);
  res.status(200).send(topMasters);
}
//getUserCampaigns
export async function getUserCampaigns(req, res) {
  try {
    const allyId = req.params.id;
    // first find all distinct  cid and campaign name
    const data = await Campaign.aggregate([
      { $match: { ally: new ObjectId(allyId) } },
      {
        $group: {
          _id: {
            cid: "$cid",
            campaignName: "$campaignName",
          },
        },
      },
    ]);
    //  data = [ {
    //   _id: {
    //     cid: 'bafybeiaq7rgx742rqazkwja5o5c754ql7qnjjo6wh4r5g5wx5eglkxklba',
    //     campaignName: 'play card'
    //   }
    // },]
    // const data2 = await CampaignForMultipleScreen.aggregate([
    //   { $match: { ally: new ObjectId(allyId) } },
    //   {
    //     $group: {
    //       _id: {
    //         cid: "$cid",
    //         campaignName: "$campaignName",
    //       },
    //     },
    //   },
    // ]);
    if (data?.length === 0) {
      return res.status(404).send({ message: "Campaign not found" });
    }

    const myCampaigns = [];

    for (let singleData of data) {
      const campaign = await Campaign.findOne({
        cid: singleData?._id?.cid,
        campaignName: singleData?._id?.campaignName,
      });
      if (campaign) {
        myCampaigns.push(campaign);
      }
    }

    const campaignsHere = myCampaigns
      .sort(
        (objA, objB) => new Date(objA?.startDate) - new Date(objB?.startDate)
      )
      .reverse();

    return res.status(200).send(campaignsHere);
  } catch (error) {
    return res.status(500).send({
      message: `User router error in getUserCampaigns ${error.message}`,
    });
  }
}

export async function getUserActiveCampaigns(req, res) {
  try {
    const allyId = req.params.id;
    // first find all distinct  cid and campaign name
    const data = await Campaign.aggregate([
      { $match: { ally: new ObjectId(allyId), status: "Active" } },
      {
        $group: {
          _id: {
            cid: "$cid",
            campaignName: "$campaignName",
          },
        },
      },
    ]);
    const data2 = await CampaignForMultipleScreen.aggregate([
      { $match: { ally: new ObjectId(allyId), status: "Active" } },
      {
        $group: {
          _id: {
            cid: "$cid",
            campaignName: "$campaignName",
          },
        },
      },
    ]);

    if (data?.length === 0 && data2.length === 0) {
      return res.status(404).send({ message: "Campaign not found" });
    } else {
      const myCampaigns = [];

      for (let singleData of data) {
        const campaign = await Campaign.findOne({
          cid: singleData?._id?.cid,
          campaignName: singleData?._id?.campaignName,
        });
        if (campaign) {
          myCampaigns.push(campaign);
        }
      }
      for (let singleData of data2) {
        const campaign2 = await Campaign.findOne({
          cid: singleData?._id?.cid,
          campaignName: singleData?._id?.campaignName,
        });
        if (campaign2) {
          myCampaigns.push(campaign2);
        }
      }
      const campaignsHere = myCampaigns
        .sort(
          (objA, objB) => new Date(objA.startDate) - new Date(objB.startDate)
        )
        .reverse();
      return res.status(200).send(campaignsHere);
    }
  } catch (error) {
    return res.status(500).send({
      message: `User router error in getUserCampaigns ${error.message}`,
    });
  }
}

//top barnds
export async function topBrand(req, res) {
  const topBrands = await User.find({
    isBrand: true,
  })
    .sort({ "brand.rating": -1 })
    .limit(7);
  res.status(200).send(topBrands);
}

// get screenList of a user
export async function getUserScreens(req, res) {
  try {
    const master = req.params.id;
    const myScreens = await Screen.find({ master: master });
    if (myScreens) return res.status(200).send(myScreens);
    return res.status(404).send({ message: "Screens not found" });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `User router error ${error.message}` });
  }
}

// delete all of  medias for user deleteAllMedias
export async function deleteAllMedias(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(401).send({
        message: "User not Found",
      });
    } else {
      const deletedMedia = await Media.deleteMany({ uploader: req.params.id });
      const updatedUser = await User.update(
        { uploader: req.params.id },
        { $set: { medias: [] } },
        { multi: true }
      );
      return res.status(200).send({
        message: "All media Deleted of user",
        medias: deletedMedia,
      });
    }
  } catch (error) {
    return res.status(404).send(error);
  }
}

export async function deleteUserWallet(req, res) {
  try {
    const user = await User.findById(req.params.id);
    const updatedUser = await user.update(
      { $set: { wallets: [] } },
      { multi: true }
    );
    const deletedWallet = Wallet.remove({ user: req.params.id });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}

// get user medias
export async function getUserMedias(req, res) {
  try {
    const mymedias = await Media.find({ uploader: req.params.id });
    if (mymedias.length > 0) return res.status(200).send(mymedias);
    else return res.status(401).send({ message: "medias not found" });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `User router error ${error.message}` });
  }
}

// seed data
export async function seedData(req, res) {
  const createdUsers = await User.insertMany(data.users);
  res.status(200).send({ createdUsers });
}

// user default wallet
export async function getDefaultWallet(req, res) {
  const user = await User.findById(req.params.id);
  if (user) {
    user.defaultWallet = req.params.walletAddress || user.defaultWallet;
    return res.status(200).send({ user });
  } else {
    return res.status(404).send({ message: "User not found" });
  }
}

// update user profile by himself/herself
export async function updateUserProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;
      user.address = req.body.address || user.address;
      user.districtCity = req.body.districtCity || user.districtCity;
      user.municipality = req.body.municipality || user.municipality;
      user.pincode = req.body.pincode || user.pincode;
      user.stateUt = req.body.stateUt || user.stateUt;
      user.country = req.body.country || user.country;
      user.isMaster = req.body.isMaster || user.isMaster;
      user.isCreator = req.body.isCreator || user.isCreator;
      user.isBrand = req.body.isBrand || user.isBrand;

      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      const updatedUser = await user.save();
      return res.status(200).send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        address: updatedUser.address,
        districtCity: updatedUser.districtCity,
        municipality: updatedUser.municipality,
        pincode: updatedUser.pincode,
        stateUt: updatedUser.stateUt,
        country: updatedUser.country,
        isItanimulli: updatedUser.isItanimulli,
        isMaster: user.isMaster,
        isCreator: user.isCreator,
        creator: user.creator,
        isBrand: user.isBrand,
        brand: user.brand,

        defaultWallet: updatedUser.defaultWallet,
        wallets: updatedUser.wallets,

        screens: updatedUser.screens,
        screensSubscribed: updatedUser.screensSubscribed,
        screensLiked: updatedUser.screensLiked,
        screensFlagged: updatedUser.screensFlagged,
        medias: updatedUser.medias,
        mediasLiked: updatedUser.mediasLiked,
        mediasFlagged: updatedUser.mediasFlagged,
        mediasViewed: updatedUser.mediasViewed,

        pleasMade: updatedUser.pleasMade,
        alliedScreens: updatedUser.alliedScreens,
        token: generateToken(user),

        createdAt: user.createdAt,
      });
    }
  } catch (error) {
    return res.status(404).send(error);
  }
}

//  user delete
export async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(401).send({
        message: "User not Found",
      });
    }
    if (user.email === "vviicckkyy55@gmail.com") {
      return res.status(400).send({
        message: "Cannot delete admin father",
      });
    }
    const deleteUser = await user.remove();
    return res.status(200).send({
      message: "User Deleted",
      user: deleteUser,
    });
  } catch (error) {
    return res.status(404).send(error);
  }
}

// update user by isItanimulli user
export async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(401).status(404).send({
        message: "User Not found",
      });
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isMaster = Boolean(req.body.isMaster);
    user.isItanimulli = Boolean(req.body.isItanimulli);
    user.isCreator = Boolean(req.body.isCreator);
    user.isBrand = Boolean(req.body.isBrand);
    user.isViewer = Boolean(req.body.isViewer);
    user.pleasMade = req.body.pleasMade || user.pleasMade;
    user.alliedScreens = req.body.alliedScreens || user.alliedScreens;
    const updatedUser = await user.save();
    return res.status(200).send({
      message: "User Updated",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(404).send(error);
  }
}

export async function getUserCouponList(req, res) {
  try {
    const userCouponList = [];
    const user = await User.findById(req.params.userId);
    //console.log("user?.rewardCoupons  : ", user?.rewardCoupons);
    for (let couponId of user?.rewardCoupons) {
      //console.log("user couponId : ", couponId);
      const singleCoupon = await CouponRewardOffer.findById(couponId);
      userCouponList.push(singleCoupon);
    }
    //console.log("User coupon list : ", userCouponList);
    return res.status(200).send(userCouponList);
  } catch (error) {
    return res.status(500).send({
      message: `User router error in getUserCouponList${error.message}`,
    });
  }
}
