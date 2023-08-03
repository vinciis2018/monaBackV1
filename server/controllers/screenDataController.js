import ScreenData from "../models/screenDataModel.js";
import Screen from "../models/screenModel.js";

//add new screen
export async function getScreenData(req, res) {
  try {
    // console.log(req.params)
    const screen = await Screen.findOne({
      _id: req.params.id
    });
    if (!screen) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }
    let screenData = await ScreenData.findOne({
      screen: screen._id
    });;
    
    if (!screenData && screen.category === "RAILWAYS") {
      screenData = new ScreenData({
        screen: screen._id,
        dataType: "RAILWAYS",
      });
      await screenData.save();

    } else if (screenData && screen.category === "RAILWAYS") {
      screenData = await ScreenData.findOne({ screen: screen._id});
    } else {
      screenData = {};
    }

    console.log(screenData.stationName);

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
      _id: req.params.id
    });
    if (!screen) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }
    let myScreenData = await ScreenData.findOne({
      screen: screen._id
    });;
    const pageSize = 6;
    const page = Number(req.params.pageNumber);

    const countDocuments = myScreenData.trains.length;
    // console.log(myScreenData)
    // console.log(dateTime);
    // console.log(pageSize);
    // console.log(countDocuments);
    const newTrainData = myScreenData.trains.splice((page - 1) * pageSize, page * pageSize); 
    myScreenData.trains = newTrainData;
    // console.log(newTrainData.length);
    // console.log(myScreenData.trains.length);

    return res.status(200).send({
      screenData : myScreenData,
      page,
      pageSize: Math.ceil(countDocuments / pageSize),
    });
  } catch (error) {
    return res.status(404).send(error);
  }
}