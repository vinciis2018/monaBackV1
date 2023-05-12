import mongoose from "mongoose";

import Reward from "../models/rewardModel.js";
import Brand from "../models/brandModel.js";
import Campaign from "../models/campaignModel.js";
import User from "../models/userModel.js";


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
     const user = await User.findOne({ _id: req.user._id });
     if (!user) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }

    if (user.brand) {
      const brand = await Brand.findOne({ _id: user.brand });
      return res.status(200).send(brand);
    } else {
      const brand = new Brand({ 
        _id: brandId,
        brandName: "BrandName" || req.body.brandName,
        user: user._id,
        rewards: [],
        additionalInfo: {},
       });
  
       user.brand.push(brandId);
  
       await user.save();
       const createdBrand = await brand.save();
      
      return res.status(200).send(createdBrand);
    }
  } catch (error) {
    return res.status(500).send({ message: `Brand router error ${error.message}` });
  }
}

export async function editBrand(req, res) {
  try {
    // brand creates a reward program, which mints reward coupons from user interaction
     const user = await User.findOne({ _id: req.user._id });
     if (!user) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }
     const brand = await Brand.findOne({ 
      _id: req.params.id,
     });

    //  console.log(user)

    brand.brandName = req.body.brandInfo.brandName
    await user.save();
    const updatedBrand = await brand.save();
    
    return res.status(200).send(updatedBrand);
  } catch (error) {
    return res.status(500).send({ message: `Brand router error ${error.message}` });
  }
}

export async function getBrandDetails(req, res) {
  try {
    // brand creates a reward program, which mints reward coupons from user interaction
     const brand = await Brand.findOne({ 
      _id: req.params.id,
     });

    //  console.log(user)

    return res.status(200).send(brand);
  } catch (error) {
    return res.status(500).send({ message: `Brand router error ${error.message}` });
  }
}