import express from "express";
import {
  createBrand, editBrand, getAllBrands, getBrandDetails,
} from "../controllers/brandController.js";
import { isAuth } from "../utils/authUtils.js";

const brandRouter = express.Router();

brandRouter.get("/all", isAuth, getAllBrands);
brandRouter.get("/details/:id", getBrandDetails);

//post request
brandRouter.post("/:id/create", isAuth, createBrand);
brandRouter.put("/update/:id", isAuth, editBrand);



export default brandRouter;
