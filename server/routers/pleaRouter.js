import express from "express";
import {
  addNewPleaForUserRedeemCouponOffer,
  getMyPleas,
  getPleaRequestListByScreenID,
  getPleaRequestListByUserID,
  giveAccessToCampaignAllyPlea,
  rejectCampaignAllyPlea,
} from "../controllers/pleaController.js";
const pleaRouter = express.Router();

//post
pleaRouter.post(
  "/addCouponRedeemPlea/:fromUser/:toUser/:couponId/:couponCode",
  addNewPleaForUserRedeemCouponOffer
);

//get
//-------get all plea request by user id
pleaRouter.get("/user/:userId", getMyPleas);
pleaRouter.get("/:id/user", getPleaRequestListByUserID);
pleaRouter.get("/:id/screen", getPleaRequestListByScreenID);

//put
pleaRouter.put(
  "/:id/campaignAllayPlea/giveAccess",
  giveAccessToCampaignAllyPlea
);
pleaRouter.put("/:id/campaignAllayPlea/reject", rejectCampaignAllyPlea);

//delete

export default pleaRouter;
