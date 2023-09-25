import express from "express";
import {
  createBrand,
  editBrand,
  getAllBrands,
  getBrandDetails,
} from "../controllers/brandController.js";
import { isAuth } from "../utils/authUtils.js";

const brandRouter = express.Router();

//get
brandRouter.get("/all", getAllBrands);
brandRouter.get("/details/:id", getBrandDetails);

//post request
brandRouter.post("/:id/create", isAuth, createBrand);
//put
brandRouter.put("/update/:id", isAuth, editBrand);

export default brandRouter;
