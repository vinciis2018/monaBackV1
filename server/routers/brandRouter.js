import express from "express";
import {
  createBrand, getAllBrands,
} from "../controllers/brandController.js";
import { isAuth } from "../utils/authUtils.js";

const brandRouter = express.Router();

brandRouter.get("all", isAuth, getAllBrands);

//post request
brandRouter.post("/:id/create", isAuth, createBrand);


export default brandRouter;
