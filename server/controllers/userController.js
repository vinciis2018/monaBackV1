import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import Screen from "../models/screenModel.js";
import Media from "../models/mediaModel.js";
import { generateToken } from "../utils/authUtils.js";
import { sendConfirmationEmail } from "../utils/sendEmail.js";
import data from "../utils/data.js";
import Campaign from "../models/campaignModel.js";

const changePassword = async (req, res, user) => {
  try {
    console.log("request came for password change");
    user.password = bcrypt.hashSync(req.body.password, 8);
    const updateUser = await user.save();
    return res.status(200).send({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      avatar: updateUser.avatar,
      isItanimulli: updateUser.isItanimulli,
      isMaster: updateUser.isMaster,
      isAlly: updateUser.isAlly,
      isBrand: updateUser.isBrand,
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
    throw new Error(error);
  }
};

export const updatePassword = async (req, res) => {
  try {
    console.log("request came for password update");
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
    console.log("request came for user signUp");
    const requestCameFromURL = `${req.header("Origin")}/`;
    console.log("requestCameFromURL : ", requestCameFromURL);
    const oldUser = await User.findOne({ email: req.body.email });
    if (oldUser && req.body.password) {
      changePassword(req, res, oldUser);
    }

    if (req.body.password === "") {
      sendConfirmationEmail(
        req.body.email,
        req.body.name,
        requestCameFromURL,
        req,
        res
      );
    }
    if (!oldUser && req.body.password) {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
      });
      const createdUser = await user.save();
      console.log("user created... ", createdUser);

      return res.status(200).send({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        avatar: createdUser.avatar,
        isItanimulli: createdUser.isItanimulli,
        isMaster: createdUser.isMaster,
        isAlly: createdUser.isAlly,
        isBrand: createdUser.isBrand,
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

export async function getUserInfoById(req, res) {
  try {
    console.log("getUserInfoById called!");
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

export async function userSignin(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .send({ message: "New user, please sign up to continue" });
    }
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      console.log("password matched");
      return res.status(200).send({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isItanimulli: user.isItanimulli,
        isMaster: user.isMaster,
        isAlly: user.isAlly,
        isBrand: user.isBrand,
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
    return res.send(error);
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

export async function topAllies(req, res) {
  const topAllies = await User.find({
    isAlly: true,
  })
    .sort({ "ally.rating": -1 })
    .limit(5);
  res.status(200).send(topAllies);
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
    console.log("getUserCampaigns called!");
    console.log("req.params.id : ", req.params.id);
    const ally = req.params.id;
    const myCampaigns = await Campaign.find({ ally });
    if (!myCampaigns) res.status(404).send({ message: "Campaign not found" });
    console.log("myCampaigns : ", myCampaigns);
    return res.status(200).send(myCampaigns);
  } catch (error) {
    res.status(500).send({ message: `User router error ${error.message}` });
  }
}

//top barnds
export async function topBrand(req, res) {
  const topBrands = await User.find({
    isAlly: true,
  })
    .sort({ "brand.rating": -1 })
    .limit(7);
  res.status(200).send(topBrands);
}

// get screenList of a user
export async function getUserScreens(req, res) {
  try {
    console.log("getUserScreens called!");
    console.log("req.params.id : ", req.params.id);
    const master = req.params.id;
    const myScreens = await Screen.find({ master: master });
    console.log("myScreens : ", myScreens.length);
    if (myScreens) return res.status(200).send(myScreens);
    return res.status(404).send({ message: "Screens not found" });
  } catch (error) {
    res.status(500).send({ message: `User router error ${error.message}` });
  }
}

// delete all of  medias for user deleteAllMedias
export async function deleteAllMedias(req, res) {
  try {
    console.log("user id : ", req.params.id);
    console.log("deleteAllMedias called!: ");
    const user = await User.findById(req.params.id);
    console.log(user);
    if (!user) {
      return res.status(401).send({
        message: "User not Found",
      });
    }
    const deletedMedia = await Media.deleteMany({ uploader: req.params.id });
    const updatedUser = await User.update(
      { uploader: req.params.id },
      { $set: { medias: [] } },
      { multi: true }
    );
    console.log("after delete all media of user : ", deletedMedia);
    console.log("media of user : ", updatedUser);
    return res.status(200).send({
      message: "All media Deleted of user",
      medias: deletedMedia,
    });
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
    console.log("getUsermedias called!");
    const mymedias = await Media.find({ uploader: req.params.id });
    // console.log("mymedias : ", mymedias);
    if (mymedias.length > 0) return res.status(200).send(mymedias);
    else return res.status(401).send({ message: "medias not found" });
  } catch (error) {
    res.status(500).send({ message: `User router error ${error.message}` });
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

      if (user.isMaster) {
        user.master.name = req.body.masterName || user.master.name;
        user.master.logo = req.body.masterLogo || user.master.logo;
        user.master.description =
          req.body.masterDescription || user.master.description;
      }
      if (user.isAlly) {
        user.ally.name = req.body.allyName || user.ally.name;
        user.ally.logo = req.body.allyLogo || user.ally.logo;
        user.ally.description =
          req.body.allyDescription || user.ally.description;
        user.ally.perHrHiring =
          req.body.allyPerHrHiring || user.ally.perHrHiring;
      }
      if (user.isBrand) {
        user.brand.name = req.body.brandName || user.brand.name;
        user.brand.logo = req.body.brandLogo || user.brand.logo;
        user.brand.description =
          req.body.brandDescription || user.brand.description;
      }

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
        isAlly: user.isAlly,
        isBrand: user.isBrand,

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
      res.status(400).send({
        message: "Cannot delete admin father",
      });
      return;
    }
    const deleteUser = await user.remove();
    res.status(200).send({
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
    user.isAlly = Boolean(req.body.isAlly);
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
