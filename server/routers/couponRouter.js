import express from "express";

import {
  createNewCoupon,
  deleteCoupon,
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

//delete
couponRouter.delete("/:couponId", deleteCoupon);

export default couponRouter;
