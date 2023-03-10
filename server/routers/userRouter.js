import express from "express";
import {
  deleteUser,
  getDefaultWallet,
  getUserScreens,
  getUsersList,
  getUserMedias,
  seedData,
  topAllies,
  topBrand,
  topMasters,
  updateUser,
  updateUserProfile,
  userSignin,
  userSignUp,
  getUserCampaigns,
} from "../controllers/userController.js";
import { isAuth, isItanimulli } from "../utils/authUtils.js";

const userRouter = express.Router();

//add new user
userRouter.post("/signup", userSignUp);
userRouter.post("/signin", userSignin);

//get request
userRouter.get("/", getUsersList);
userRouter.get("/top-masters", topMasters);
userRouter.get("/top-allies", topAllies);
userRouter.get("/top-brands", topBrand);
userRouter.get("/seed", seedData);
userRouter.get("/:id/:walletAddress", getDefaultWallet);
userRouter.get("/:id/:wallet/myScreens", isAuth, getUserScreens); // tested
userRouter.get("/:id/:wallet/myMedias", isAuth, getUserMedias);
userRouter.get("/:id/:wallet/myCampaign", isAuth, getUserCampaigns); // tested
//put request
userRouter.put("/profile", isAuth, updateUserProfile);
userRouter.put("/:id", isAuth, isItanimulli, updateUser);

//detele request
userRouter.delete("/:id", isAuth, isItanimulli, deleteUser);

export default userRouter;
