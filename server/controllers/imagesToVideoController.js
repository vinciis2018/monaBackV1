import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { generateRandonNumberOfLengthN } from "../utils/utils.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import sizeOf from "image-size";

import Media from "../models/mediaModel.js";
import User from "../models/userModel.js";

export const __dirname = path.resolve();
// if using in production
// const __dirname = path.resolve() + "/monaBackV1";
// because in ubuntu path.resolve() = /home/ubuntu
export const token = process.env.REACT_APP_WEB3_STORAGE_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczQTg1YzJhQTVmNzU1ZTM4MUUxODhmYkI2ZTg3M0E3MEJGRUQ2RjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjMxODkwNjgyOTEsIm5hbWUiOiJtb25hX2JldGEifQ.pONwiaib6R_lPL2bop4cTgk5-Z2Otf4723aDJjEYDLY";
// console.log("token : ", token);
export const storage = new Web3Storage({ token });

ffmpeg.setFfmpegPath(ffmpegStatic);

//first save file in local
const localStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    console.log("file : ", file);
    console.log("directory name : ", req.dirName);

    callback(null, path.join(__dirname, "server", "mediaFiles", req.dirName));
  },
  filename: (req, file, callback) => {
    callback(null, `frame-001.png`);
  },
});

// use to add file in locally
export const upload = multer({
  storage: localStorage,
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

export const createVideoFromImage = (req, res, next) => {
  try {
    console.log("createVideoFromImage : called! : ", req.dirName);
    //after successfully uploaded image in folder
    const dimensions = sizeOf(path.join( __dirname,
      "server",
      "mediaFiles",
      req.dirName,
      // "G3O95OBr",
      "frame-001.png"));
      const size = `${dimensions.width}x${dimensions.height}`;
    //   const aspectRatio = JSON.stringify(dimensions.width / dimensions.height);
    // console.log(size);
    // now create video from image
    ffmpeg()
      .input(
        path.join(
          __dirname,
          "server",
          "mediaFiles",
          req.dirName,
          // "G3O95OBr",
          "frame-001.png"
        )
      )
      .loop("5")
      .inputOptions("-framerate", "30")
      .videoBitrate("1024k")
      .videoCodec("libx264")
      // .size("720x?") // get size from the image uploaded
      .size(`"${dimensions.width}x${dimensions.height}"`) // get size from the image uploaded
      // .aspect("16:9") // get aspect ratio from the image uploaded
      .outputOptions("-pix_fmt", "yuv420p")
      .saveToFile(
        path.join(__dirname, "server", "mediaFiles", req.dirName, "video.mp4")
      // "../mediaFiles/G3O95OBr/output.mp4"
      )
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on("end", async () => {
        console.log("FFmpeg has finished");
        // after finnish video create now upload video on web3.storage

        const files = [];
        const videoPath = path.join(
          __dirname,
          "server",
          "mediaFiles",
          req.dirName,
          "video.mp4"
        );

        const pathFiles = await getFilesFromPath(videoPath);
        files.push(...pathFiles);
        console.log(`Uploading ${files.length} files`);
        const cid = await storage.put(files);
        console.log("Content added with CID:", cid);
        let resp = await storage.get(cid);
        // console.log("response : ", resp);
        const Videofiles = await resp?.files() || []; // Web3File[]
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
            const newMedia = await media.save();

            mediaUser.medias.push(newMedia._id);
            await mediaUser.save();
            
            fs.rm(path.join(__dirname, "server", "mediaFiles", req.dirName), {
              recursive: true,
            }, (error) => {
              if (error) {
                console.log(error);
              }
              else {
                console.log("Recursive: Directories Deleted!");
              }
            });
          
            return res.status(200).send(newMedia);

          }
        }
      })
      .on("error", (error) => {
        console.error("error 88888988 : ", error);
        return res.status(400).send({ message: error });
      });
    // const loopTime = req.body.loopTime;
  } catch (err) {
    console.log("error : ", err);
    return res.status(400).send({ message: err });
  }
};
