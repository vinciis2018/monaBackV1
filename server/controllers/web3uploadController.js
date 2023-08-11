import { uploadWeb3File, createWeb3Name } from "../helpers/uploadWeb3Storage.js"
import ScreenLogs from "../models/screenLogsModel.js";
import Screen from "../models/screenModel.js";
import path from "path";
import fs from "fs";
import { __dirname } from "./imagesToVideoController.js";

export const createIpfsData = async (req, res, next) => {
  try {
    console.log(req.params);
    const screen = await Screen({ _id: req.params.screenId });
    const screenLogs = await ScreenLogs.findOne({ screen: screen._id });
    const outputFilename = path.join(__dirname, "server", "random", "screenlogs", `${req.params.screenId}`);
    
    req.outputFilename = outputFilename;
    req.screenLogs = screenLogs;
    req.screenId = screen._id;
    // console.log(screenLogs);
    console.log(screen._id);
    
    if (screenLogs.playingDetails.length >= 5000) {
      const fileDetails = await uploadWeb3File(req);

      const carDetails = await createWeb3Name(req);
  
      const datai = {
        date: new Date(),
        data: {
          carDetails: carDetails,
          fileDetails: fileDetails
        }
      }
  
      console.log(datai);
      if (screenLogs.dataIpfs.filter((d) => d.data.fileDetails.cid === datai.data.fileDetails.cid).length !== 0) {
        screenLogs.dataIpfs ? screenLogs.dataIpfs.push(datai) : screenLogs.dataIpfs[datai];
      }
      screenLogs.playingDetails = [];
    }
    
    await screenLogs.save();
    console.log("saved");

    return res.status(200).send({ carDetails, fileDetails });
  } catch (err) {
    console.log("error : ", err);
    return res.status(400).send({ message: err });
  }
}
