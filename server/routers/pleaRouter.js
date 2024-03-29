import express from "express";
import {
  addNewPleaForUserRedeemCouponOffer,
  addPurchaseDetailsInCoupon,
  getAllPleaListForBrand,
  getAllPleaRequestAsScreenOwner,
  getPleaRequestListByScreenID,
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
pleaRouter.get("/user/:userId", getAllPleaListForBrand);
pleaRouter.get("/:id/user", getAllPleaRequestAsScreenOwner);
pleaRouter.get("/:id/screen", getPleaRequestListByScreenID);

//put
pleaRouter.put("/addPurchaseDetailsInCoupon", addPurchaseDetailsInCoupon);

pleaRouter.put(
  "/:id/campaignAllayPlea/giveAccess",
  giveAccessToCampaignAllyPlea
);
pleaRouter.put("/:id/campaignAllayPlea/reject", rejectCampaignAllyPlea);
//delete

export default pleaRouter;
