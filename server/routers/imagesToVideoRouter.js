import express from "express";
import {
  createFolder,
  createVideoFromImage,
  upload,
} from "../controllers/imagesToVideoController.js";
const imageRouter = express.Router();

imageRouter.post("/:userId", createFolder, upload, createVideoFromImage);

export default imageRouter;
