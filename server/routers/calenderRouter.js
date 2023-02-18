import express from "express";
import {
  addSlotEnquiry,
  bookCalendarSlot,
  bookCalendarSlotDayWise,
  getAllSlots,
  getDayDetails,
} from "../controllers/calenderController.js";

import { isAuth } from "../utils/authUtils.js";

const calenderRouter = express.Router();

//post request
calenderRouter.post("/screen/:id/day", isAuth, getDayDetails);

//get request
calenderRouter.get("/screen/:id/slots", getAllSlots);

//put request
calenderRouter.put("/screen/:id", addSlotEnquiry);
calenderRouter.put(
  "/screen/:id/slot/:slotId/booking",
  isAuth,
  bookCalendarSlot
);
calenderRouter.put(
  "/screen/:id/day/:dayId/booking",
  isAuth,
  bookCalendarSlotDayWise
);

//delete request

export default calenderRouter;
