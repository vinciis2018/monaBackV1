import ScreenData from "../models/screenDataModel.js";
import Screen from "../models/screenModel.js";
import mongoose from "mongoose";

//add new screen
export async function getScreenDataByScreenId(req, res) {
  try {
    // console.log(req.params.screenId);
    const screenData = await ScreenData.findOne({
      screen: req.params.screenId,
    });
    return res.status(200).send({
      screenData,
    });

  } catch (error) {
    return res.status(404).send(error);
  }
}

export async function getScreenDataByDate(req, res) {
  try {
    // console.log(req.params)
    const screen = await Screen.findOne({
      _id: req.params.id,
    });
    if (!screen) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }
    let myScreenData = await ScreenData.findOne({
      screen: screen._id,
    });
    const pageSize = 6;
    const page = Number(req.params.pageNumber);

    const countDocuments = myScreenData.trains.length;
    // console.log(myScreenData)
    // console.log(dateTime);
    // console.log(pageSize);
    // console.log(countDocuments);
    const newTrainData = myScreenData.trains.splice(
      (page - 1) * pageSize,
      page * pageSize
    );
    myScreenData.trains = newTrainData;
    // console.log(newTrainData.length);
    // console.log(myScreenData.trains.length);

    return res.status(200).send({
      screenData: myScreenData,
      page,
      pageSize: Math.ceil(countDocuments / pageSize),
    });
  } catch (error) {
    return res.status(404).send(error);
  }
}

export async function scanQrDataSave(req, res) {
  try {
    const screenData = await ScreenData.findOne({
      screen: req.params.screenId,
    });
    if (screenData.qrScanData === undefined) {
      screenData.qrScanData = {};
    }
    const data = {
      scanUser: req?.body?.scanUser,
      scanTime: req.body.scanResult.timestamp || new Date(),
      userLat: req.body.scanResult.userLat,
      userLng: req.body.scanResult.userLng,
    };
    screenData.qrScanData.scanText = req.body.scanResult.text;
    screenData.qrScanData.scanDetails.push(data);
    const updatedScanData = await screenData.save();
    console.log(req.body);
    // console.log(updatedScanData);

    return res.status(200).send(updatedScanData);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
}

export async function getQrScanData(req, res) {
  try {
    const screenData = await ScreenData.findOne({
      screen: req.params.screenId,
    });
    if (!screenData)
      return res.status(404).send({ message: "Scan Data not found!" });
    console.log("screenData : ", screenData);

    if (screenData.qrScanData === undefined || !screenData.qrScanData) {
      screenData.qrScanData = {};
    }
    const scanQrData = screenData.qrScanData;
    return res.status(200).send(scanQrData);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
}
