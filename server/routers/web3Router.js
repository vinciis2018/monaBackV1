import express from "express";

// import { uploadWeb3File, uploadWeb3Name } from "../helpers/uploadWeb3Storage.js";
import { createIpfsData } from "../controllers/web3uploadController.js";
const web3Router = express.Router();

web3Router.post("/uploadName/:screenId", createIpfsData)

export default web3Router;