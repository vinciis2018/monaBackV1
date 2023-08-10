import express from "express";
import { qrcodeGenerateForScreen } from "../controllers/qrcodeGenerator.js";
const qrcodeRouter = express.Router();

//post

qrcodeRouter.post("/create/:screenId", qrcodeGenerateForScreen);

export default qrcodeRouter;
