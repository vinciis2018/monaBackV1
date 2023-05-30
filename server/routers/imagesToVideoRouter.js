import express from "express";
import {
  createFolder,
  createVideoFromImage,
  // deleteFolder,
  upload,
} from "../controllers/imagesToVideoController.js";
const imageRouter = express.Router();

imageRouter.post("/:userId", createFolder, upload, createVideoFromImage);

export default imageRouter;
