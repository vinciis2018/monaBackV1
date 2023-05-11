import mongoose from "mongoose";

import Reward from "../models/rewardModel.js";
import Brand from "../models/brandModel.js";
import Campaign from "../models/campaignModel.js";


export async function getAllBrands(req, res) {
  try {
    const allBrands = await Brand.find();
    if (!getAllBrands) return res.status(404).send("No Brands Found!");
    return res.status(200).send(allBrands);
  } catch (error) {
    return res.status(500).send({ message: `Brand router error ${error.message}` });
  }
}

export async function createBrand(req, res) {
  try {
    // brand creates a reward program, which mints reward coupons from user interaction
     const brandId = new mongoose.Types.ObjectId();

     const brand = new Brand({ 
      _id: brandId,
      brandName: "BrandName" || req.body.brandName,
      user: req.body.user,
      rewards: [],
     });
    
     const createdBrand = await brand.save();
    return res.status(200).send(createdBrand);
  } catch (error) {
    return res.status(500).send({ message: `Brand router error ${error.message}` });
  }
}