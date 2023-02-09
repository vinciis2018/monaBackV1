import express from "express";
import {
  addNewPin,
  getAllPins,
  getAllPinsGeoJson,
  getPinDetailsByPinId,
  getPinSeed,
  updatePinByPinId,
} from "../controllers/pinController.js";

const pinRouter = express.Router();

//post request
pinRouter.post("/", addNewPin); // not tested

//get request
pinRouter.get("/", getAllPins); // tested
pinRouter.get("/allPinGeoJson", getAllPinsGeoJson); // tested
pinRouter.get("/:id", getPinDetailsByPinId); // tested
pinRouter.get("/seed", getPinSeed);

//put request
pinRouter.put("/:id", updatePinByPinId); // not tedeted

//delete request

export default pinRouter;
