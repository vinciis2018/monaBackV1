import express from "express";

import {
  addOrRemoveCouponToUserWishlist,
  addRedeemerToCoupon,
  createNewCoupon,
  deleteCoupon,
  getAllActiveCouponList,
  getCouponDetailsAlongWithCampaignsAndScreens,
  getCouponListForBrand,
  getCouponListForUser,
  updateCoupon,
} from "../controllers/couponsController.js";
const couponRouter = express.Router();

// post
couponRouter.post("/create/:userId/:brandId", createNewCoupon);
couponRouter.post("/addOrRemoveWishlist", addOrRemoveCouponToUserWishlist);

//get
couponRouter.get("/getActiveCoupons", getAllActiveCouponList);
couponRouter.get("/user/:userId", getCouponListForUser);
couponRouter.get(
  "/couponDetails/:id",
  getCouponDetailsAlongWithCampaignsAndScreens
);
couponRouter.get("/:brandId", getCouponListForBrand);

//put
couponRouter.put("/:couponId", updateCoupon);
couponRouter.put("/:id/:userId/:screenId", addRedeemerToCoupon);

//delete
couponRouter.delete("/:couponId/:status", deleteCoupon);

export default couponRouter;
