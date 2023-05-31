import express from "express";
import {
  addNewPleaForUserRedeemCouponOffer,
  getPleaRequestListByScreenID,
  getPleaRequestListByUserID,
  giveAccessToCampaignAllyPlea,
  rejectCampaignAllyPlea,
} from "../controllers/plaeController.js";
const pleaRouter = express.Router();

//post
pleaRouter.post(
  "/addCouponRedeemPlea/:fromUser/:toUser/:couponId/:couponCode",
  addNewPleaForUserRedeemCouponOffer
);

//get
//-------get all plea request by user id

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
