import mongoose from "mongoose";

import Reward from "../models/rewardModel.js";
import Brand from "../models/brandModel.js";
import Campaign from "../models/campaignModel.js";
import User from "../models/userModel.js";
import { generateToken } from "../utils/authUtils.js";

export async function getAllBrands(req, res) {
  try {
    const getBrands = await Brand.find();
    if (!getAllBrands) {
      return res.status(404).send("No Brands Found!");
    } else {
      const allBrands = getBrands.reverse();
      return res.status(200).send(allBrands);
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Brand router error ${error.message}` });
  }
}

export async function createBrand(req, res) {
  try {
    // brand creates a reward program, which mints reward coupons from user interaction
    const brandId = new mongoose.Types.ObjectId();
    // console.log("createBrand called !", req.body);
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }

    if (user.brand.length > 0) {
      // console.log("1 called !", user.brand.length);

      const brand = await Brand.findOne({ _id: user.brand[0] });
      // console.log("2 called !");
      return res.status(200).send(brand);
    } else {
      // console.log("3 called !");
      const brand = new Brand({
        _id: brandId,
        brandName: req.body.brandName,
        tagline: req.body.tagline,
        address: req.body.address,
        brandCategory: req.body.brandCategory,
        brandType: req.body.brandType,
        user: user._id,
        affiliatedUsers: req.body.affiliatedUsers || [],
        rewards: [],
        additionalInfo: {},
        brandDetails: {
          website: req.body.website,
          aboutBrand: req.body.aboutBrand,
          logo: req.body.logo,
          images: req.body.images,
          phone: req.body.phone,
          email: req.body.email,
          instagramId: req.body.instagramId,
          facebookId: req.body.facebookId,
          snapchat: req.body.snapchat,
          youtube: req.body.youtube,
          linkedin: req.body.linkedin,
          twitter: req.body.twitter,
        },
      });

      user.brand.push(brandId);
      user.isBrand = true;

      const updateUser = await user.save();
      const createdBrand = await brand.save();
      // console.log("4 called !");
      return res.status(200).send(createdBrand);
    }
  } catch (error) {
    return res
      .status(404)
      .send({ message: `Brand router error ${error.message}` });
  }
}

export async function editBrand(req, res) {
  try {
    const brand = await Brand.findOne({
      _id: req.params.id,
    });

    //  console.log(brand);

    brand.brandName = req.body.brandName || brand.brandName;
    brand.tagline = req.body.tagline || brand.tagline;
    brand.address = req.body.address || brand.address;
    brand.brandCategory = req.body.brandCategory || brand.brandCategory;
    brand.brandType = req.body.brandType || brand.brandType;
    brand.affiliatedUsers = req.body.affiliatedUsers || brand.affiliatedUsers;
    brand.brandDetails = {
      website: req.body.website || brand.brandDetails.website,
      aboutBrand: req.body.aboutBrand || brand.brandDetails.aboutBrand,
      logo: req.body.logo || brand.brandDetails.logo,
      images: brand.brandDetails.images,
      phone: req.body.phone || brand.brandDetails.phone,
      email: req.body.email || brand.brandDetails.email,
      instagramId: req.body.instagramId || brand.brandDetails.instagramId,
      facebookId: req.body.facebookId || brand.brandDetails.facebookId,
      snapchat: req.body.snapchat || brand.brandDetails.snapchat,
      youtube: req.body.youtube || brand.brandDetails.youtube,
      linkedin: req.body.linkedin || brand.brandDetails.linkedin,
      twitter: req.body.twitter || brand.brandDetails.twitter,
    };
    if (req.body.images) {
      for (let image of req.body.images) {
        // console.log(brand.brandDetails.images.map((img) => img === image).length);
        if (
          brand.brandDetails.images.filter((img) => img === image).length === 0
        ) {
          // console.log(brand.brandDetails.images);

          brand.brandDetails.images.push(image);
          // console.log(brand.brandDetails.images);
          await brand.save();
        }
      }
    }

    const updatedBrand = await brand.save();

    console.log("updatedBrand : ", updatedBrand);

    return res.status(200).send(updatedBrand);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Brand router error ${error.message}` });
  }
}

export async function getBrandDetails(req, res) {
  try {
    // brand creates a reward program, which mints reward coupons from user interaction
    const brand = await Brand.findById(req.params.id);

    if (!brand) return res.status(404).send("No brand found!");

    return res.status(200).send(brand);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Brand router error ${error.message}` });
  }
}
