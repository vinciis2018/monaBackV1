import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import Screen from "../models/screenModel.js";
import Video from "../models/videoModel.js";
import { generateToken } from "../utils/authUtils.js";
import { sendConfirmationEmail } from "../utils/sendEmail.js";
import data from "../utils/data.js";

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
      videos: updateUser.videos,
      videosLiked: updateUser.videosLiked,
      videosFlagged: updateUser.videosFlagged,
      videosViewed: updateUser.videosViewed,
      pleasMade: updateUser.pleasMade,
      alliedScreens: updateUser.alliedScreens,
      createdAt: updateUser.createdAt,
      token: generateToken(updateUser),
    });
  } catch (error) {
    return error;
  }
};

export async function userSignUp(req, res) {
  try {
    const newUser = await User.findOne({ email: req.body.email });
    if (newUser && req.body.password) {
      changePassword(req, res, newUser);
    }

    if (req.body.password === "") {
      sendConfirmationEmail(req.body.email, req.body.name);
      return res.status(200).send({
        message: "Email sent to your ragistered email.",
      });
    }
    if (!newUser && req.body.password) {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
      });
      const createdUser = await user.save();
      console.log("user created...");

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
        videos: createdUser.videos,
        videosLiked: createdUser.videosLiked,
        videosFlagged: createdUser.videosFlagged,
        videosViewed: createdUser.videosViewed,
        pleasMade: createdUser.pleasMade,
        alliedScreens: createdUser.alliedScreens,
        createdAt: createdUser.createdAt,
        token: generateToken(createdUser),
      });
    }
  } catch (error) {
    return res.status(404).send(error);
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

        defaultWallet: user.defaultWallet,
        wallets: user.wallets,

        screens: user.screens,
        screensSubscribed: user.screensSubscribed,
        screensLiked: user.screensLiked,
        screensFlagged: user.screensFlagged,
        videos: user.videos,
        videosLiked: user.videosLiked,
        videosFlagged: user.videosFlagged,
        videosViewed: user.videosViewed,

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
    const myScreens = await Screen.find({ master });
    console.log("myScreens : ", myScreens);
    if (myScreens) return res.status(200).send(myScreens);
    return res.status(404).send({ message: "Screens not found" });
  } catch (error) {
    res.status(500).send({ message: `User router error ${error.message}` });
  }
}

// get user videos
export async function getUserVideos(req, res) {
  try {
    console.log("getUserVideos called!");
    const myVideos = await Video.find({ uploader: req.params.id });
    if (myVideos) return res.status(200).send(myVideos);
    else return res.status(401).send({ message: "Videos not found" });
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
        videos: updatedUser.videos,
        videosLiked: updatedUser.videosLiked,
        videosFlagged: updatedUser.videosFlagged,
        videosViewed: updatedUser.videosViewed,

        pleasMade: updatedUser.pleasMade,
        alliedScreens: updatedUser.alliedScreens,

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
