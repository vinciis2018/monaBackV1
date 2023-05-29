import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { generateRandonNumberOfLengthN } from "../utils/utils.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import Media from "../models/mediaModel.js";
import User from "../models/userModel.js";
const __dirname = path.resolve();

ffmpeg.setFfmpegPath(ffmpegStatic);

const createVideoFromImageaaa = () => {
  ffmpeg()
    .input("../mediaFiles/images/frame-001.png")
    .loop("5")
    .inputOptions("-framerate", "30")
    .videoCodec("libx264")
    .outputOptions("-pix_fmt", "yuv420p")
    .saveToFile("../mediaFiles/videos/video.mp4")
    .on("progress", (progress) => {
      if (progress.percent) {
        console.log(`processing: ${Math.floor(progress.percent)}% done`);
      }
    })
    .on("end", () => {
      console.log("FFmpeg has finished");
    })
    .on("error", (error) => {
      console.error(error);
    });
};

//first save file in local
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    console.log("file : ", file);
    console.log("dorectory name : ", req.dirName);

    callback(null, path.join(__dirname, "server", "mediaFiles", req.dirName));
  },
  filename: (req, file, callback) => {
    callback(null, `frame-001.png`);
  },
});

// use to add file in locally
export const upload = multer({
  storage: storage,
}).single("photo");

// it use to create folter with randon name
export const createFolder = (req, res, next) => {
  console.log("create folder function called");
  console.log("__dirname : ", __dirname);
  const dirName = generateRandonNumberOfLengthN();
  fs.mkdirSync(path.join(__dirname, "server", "mediaFiles", dirName));
  req.dirName = dirName;
  next();
  return;
};

export const createVideoFromImage = (req, res) => {
  try {
    console.log("createVideoFromImage : called! : ", req.dirName);
    //after successfully uploaded image in folder
    // now create video from image
    ffmpeg()
      .input(
        path.join(
          __dirname,
          "server",
          "mediaFiles",
          req.dirName,
          `frame-001.png`
        )
      )
      .loop("5")
      .inputOptions("-framerate", "30")
      .videoCodec("libx264")
      .outputOptions("-pix_fmt", "yuv420p")
      .saveToFile(
        path.join(__dirname, "server", "mediaFiles", req.dirName, "output.mp4")
      )
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on("end", async () => {
        console.log("FFmpeg has finished");
        // after finnish video create now upload video on web3.storage
        const token = process.env.REACT_APP_WEB3_STORAGE_API_TOKEN;
        console.log("token : ", token);
        const storage = new Web3Storage({ token });
        const files = [];
        const videoPath = path.join(
          __dirname,
          "server",
          "mediaFiles",
          req.dirName,
          "output.mp4"
        );

        const pathFiles = await getFilesFromPath(videoPath);
        files.push(...pathFiles);

        console.log(`Uploading ${files.length} files`);
        const cid = await storage.put(files);
        console.log("Content added with CID:", cid);
        let res = await storage.get(cid);
        console.log("response : ", res);
        const Videofiles = (await res?.files()) || []; // Web3File[]
        for (const file of Videofiles) {
          //getting cid to create new media
          console.log(`${file.cid} ${file.name} ${file.size}`);
          console.log(
            "`https://ipfs.io/ipfs/${cid}` : ",
            `https://ipfs.io/ipfs/${file.cid}`
          );
          //going to create new media from this this cid
          const mediaUser = await User.findOne({
            _id: req.params.userId,
          });

          if (mediaUser) {
            const media = new Media({
              title: req.body.title || "Title here",
              description: req.body.description || "It is media description",
              media:
                `https://ipfs.io/ipfs/${file.cid}` ||
                "https://ipfs.io/ipfs/QmNubs7ShhWUDcUN2kSmTxp6HvLE4zdz5UnFRKDdF9i1n8",
              // duration: duration,
              thumbnail:
                req.body.thumbnail ||
                "https://ipfs.io/ipfs/Qmf1mxa1NMYC2LCUoQabntCJubXjDrXtVn4Jsin8F3cdos",
              uploader: mediaUser._id,
              uploaderName: mediaUser.name,
              // category: req.body.campaign.category,
              brandName: req.body.brandName || "dummy brand",
              adWorth: req.body.adWorth || 0,
              adBudget: req.body.adBudget || 0,
              expectedViews: req.body.expectedViews || 0,
              hrsToComplete: req.body.hrsToComplete || 0,
              mediaTags: req.body.advertTags || ["blinds", "vinciis", "koii"],
            });
            const newmedia = await media.save();

            mediaUser.medias.push(newmedia._id);
            await mediaUser.save();

            return res.status(201).send(newmedia);
          }
        }
      })
      .on("error", (error) => {
        console.error("error 88888988 : ", error);
        return res.status(400).send({ message: error });
      });
    // const loopTime = req.body.loopTime;
  } catch (error) {
    console.log("error : ", error);
    return res.status(400).send({ message: error });
  }
};
