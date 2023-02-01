import express from "express";
import {
  deleteUser,
  getDefaultWallet,
  getUsersList,
  seedData,
  topAllies,
  topBrand,
  topMasters,
  updateUser,
  updateUserProfile,
  userSignin,
  userSignUp,
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

//put request
userRouter.put("/profile", isAuth, updateUserProfile);
userRouter.put("/:id", isAuth, isItanimulli, updateUser);

//detele request
userRouter.delete("/:id", isAuth, isItanimulli, deleteUser);

export default userRouter;
