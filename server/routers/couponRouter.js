import express from "express";

import {
  addRedeemerToCoupon,
  createNewCoupon,
  deleteCoupon,
  getAllActiveCouponList,
  getCouponListForBrand,
  getCouponListForUser,
  updateCoupon,
} from "../controllers/couponsController.js";
const couponRouter = express.Router();

// post
couponRouter.post("/create/:userId/:brandId", createNewCoupon);

//get
couponRouter.get("/getActiveCoupons", getAllActiveCouponList);
couponRouter.get("/user/:userId", getCouponListForUser);
couponRouter.get("/:brandId", getCouponListForBrand);

//put
couponRouter.put("/:couponId", updateCoupon);
couponRouter.put("/:id/:userId/:screenId", addRedeemerToCoupon);

//delete
couponRouter.delete("/:couponId", deleteCoupon);

export default couponRouter;
