import express from "express";

import {
  createNewCoupon,
  getAllActiveCouponList,
  getCouponListForBrand,
  updateCoupon,
} from "../controllers/couponsController.js";
const couponRouter = express.Router();

// post
couponRouter.post("/create/:userId/:brandId", createNewCoupon);

//get
couponRouter.get("/getActiveCoupons", getAllActiveCouponList);
couponRouter.get("/:brandId", getCouponListForBrand);

//put
couponRouter.put("/:couponId", updateCoupon);

export default couponRouter;
