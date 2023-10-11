import express from "express";
import {
  deleteUser,
  getDefaultWallet,
  getUserScreens,
  getUsersList,
  getUserMedias,
  seedData,
  topCreators,
  topBrand,
  topMasters,
  updateUser,
  updateUserProfile,
  userSignin,
  userSignUp,
  getUserCampaigns,
  deleteAllMedias,
  updatePassword,
  getUserInfoById,
  getUserActiveCampaigns,
  userSigninWithGoogleLogin,
  sendEmailToSetPassword,
  filterUserByNameOrEmailOrPhone,
  getUserWishlist,
} from "../controllers/userController.js";
import { isAuth, isItanimulli } from "../utils/authUtils.js";

const userRouter = express.Router();

//add new user
userRouter.post("/signup", userSignUp);
userRouter.post("/signin", userSignin);
userRouter.post("/googleSignupSignin", userSigninWithGoogleLogin);
userRouter.post("/sendEmailToSetPassword", sendEmailToSetPassword);

//get request
userRouter.get("/", getUsersList);
userRouter.get("/top-masters", topMasters);
userRouter.get("/top-creators", topCreators);
userRouter.get("/top-brands", topBrand);
userRouter.get("/seed", seedData);
userRouter.get("/filterUser/:searchString", filterUserByNameOrEmailOrPhone);
userRouter.get("/getUserWishlist/:userId", getUserWishlist);

userRouter.get("/:id/:walletAddress", getDefaultWallet);
userRouter.get("/gus/:id/myScreens", getUserScreens); // tested
userRouter.get("/gum/:id/myMedias", isAuth, getUserMedias);
userRouter.get("/guc/:id/myCampaign", getUserCampaigns); // tested
userRouter.get("/guac/:id/myActiveCampaigns", getUserActiveCampaigns); // tested

userRouter.get("/:id/:walletAddress", getUserInfoById);
//put request
userRouter.put("/profile", isAuth, updateUserProfile);
userRouter.put("/:id", isAuth, isItanimulli, updateUser);
userRouter.put("/:id/updatePassword", updatePassword);

//detele request
userRouter.delete("/:id", isAuth, isItanimulli, deleteUser);
userRouter.delete("/:id/medias", deleteAllMedias);

export default userRouter;
