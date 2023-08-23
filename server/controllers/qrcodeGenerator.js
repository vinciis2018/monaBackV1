import QRCode from "qrcode";
import { generateRandonNumberOfLengthN } from "../utils/utils.js";
import fs from "fs";
import path from "path";

import { Web3Storage, getFilesFromPath } from "web3.storage";
import Screen from "../models/screenModel.js";
import { __dirname, storage } from "./imagesToVideoController.js";
// const __dirname = path.resolve();
// const token =
//   process.env.REACT_APP_WEB3_STORAGE_API_TOKEN ||
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczQTg1YzJhQTVmNzU1ZTM4MUUxODhmYkI2ZTg3M0E3MEJGRUQ2RjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjMxODkwNjgyOTEsIm5hbWUiOiJtb25hX2JldGEifQ.pONwiaib6R_lPL2bop4cTgk5-Z2Otf4723aDJjEYDLY";
// const storage = new Web3Storage({ token });

const handelError = async (err, filePath, screen) => {
  if (err) {
    console.log("error occured in create qr image");
    return Promise.reject(err);
  } else {
    const files = [];
    const pathFiles = await getFilesFromPath(filePath);
    files.push(...pathFiles);
    // console.log(`Uploading ${files.length} files`);
    const cid = await storage.put(files);
    let resp = await storage.get(cid);
    const Videofiles = (await resp?.files()) || []; // Web3File[]
    for (const file of Videofiles) {
      //getting cid to create new media
      console.log(`${file.cid} ${file.name} ${file.size}`);

      // delete file
      fs.unlinkSync(filePath);
      return Promise.resolve(`https://ipfs.io/ipfs/${file.cid}`);
    }
  }
};

export const qrcodeGenerateForScreen = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.screenId);
    const fileName = generateRandonNumberOfLengthN();
    const filePath = path.join(
      __dirname,
      "server",
      "mediaFiles",
      `${fileName}.png`
    );
    QRCode.toFile(
      filePath,
      `/coupon/screen/${screen?._id}`,
      {
        errorCorrectionLevel: "H",
      },
      async function (err) {
        try {
          const url = await handelError(err, filePath, req, res, screen);
          screen.qrCode = url;
          await screen.save();
          console.log("screen qr code saved!");
          return res.status(200).send("QRcode successfully added to screen");
        } catch (error) {
          console.log("Error in QR code saving : ", error.message);
          return res.status(500).send("Error in QR code generating");
        }
      }
    );
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
