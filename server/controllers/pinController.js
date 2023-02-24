import Screen from "../models/screenModel.js";
import Pin from "../models/pinModel.js";

// get all pins data from pin collection
export async function getAllPins(req, res) {
  try {
    const allPins = await Pin.find();
    if (!allPins) return res.status(404).send("No Pins Found!");
    return res.status(200).send(allPins);
  } catch (error) {
    res.status(500).send({ message: `Pin router error ${error.message}` });
  }
}

//get single pindetails by pinId
export async function getPinDetailsByPinId(req, res) {
  try {
    console.log("getPinDetailsByPinId called!");
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).send("No Pin Found!");
    const jsonData = {
      features: [
        {
          type: "Feature",
          properties: {
            pin: pin._id,
            category: pin.category,
            screenPin: pin.screenPin,
            screen: pin.screen,
            image: pin.image,
            activeGame: pin.activeGame,
          },
          geometry: {
            coordinates: [pin.lat, pin.lng],
            type: "Point",
          },
        },
      ],
    };
    return res.status(200).send(jsonData);
  } catch (error) {
    res.status(500).send({ message: `Pin router error ${error.message}` });
  }
}
// get all pins in GeoJson
export async function getAllPinsGeoJson(req, res) {
  try {
    console.log("getAllPinsGeoJson called!");
    const allPins = await Pin.find();
    //console.log("app pins : ", allPins);
    if (!allPins) return res.status(404).send(error);
    const jsonData = {
      features: allPins.map((pin) => {
        return {
          type: "Feature",
          properties: {
            pin: pin._id,
            category: pin.category,
            screenPin: pin.screenPin,
            screen: pin.screen,
            image: pin.image,
            activeGame: pin.activeGame,
          },
          geometry: {
            coordinates: [pin.lat, pin.lng],
            type: "Point",
          },
        };
      }),
    };

    return res.status(200).send(jsonData);
  } catch (error) {
    res.status(500).send({ message: `Pin router error ${error.message}` });
  }
}
// getPinSeed
export async function getPinSeed(req, res) {
  try {
    const createdPins = await Pin.insertMany(data.pins);
    res.send({ createdPins });
  } catch (error) {
    res.status(500).send({ message: `Pin router error ${error.message}` });
  }
}

//add new pin
export async function addNewPin(req, res) {
  try {
    const newPin = new Pin(req.body);

    newPin.lat = req.body.lat;
    newPin.lng = req.body.lng;
    newPin.category = req.body.category;
    newPin.user = req.body.user;

    const screen = await Screen.findById(req.body.screen);

    newPin.screenPin = req.body.screenPin;
    newPin.screen = req.body.screen;
    newPin.image = screen.image;
    newPin.activeGame = screen.activeGameContract;

    const pinAdded = await newPin.save();
    console.log(pinAdded);
    return res.status(200).send(pinAdded);
  } catch (error) {
    res.status(500).send({ message: `Pin router error ${error.message}` });
  }
}
// update pin details by screen id // no need to call this function?
export async function updatePinByPinId(req, res) {
  try {
    const screen = await Screen.findById(req.params.id);

    const pinId = screen.locationPin;
    const pin = await Pin.findById(pinId);
    try {
      pin.lat = req.body.lat || pin.lat;
      pin.lng = req.body.lng || pin.lng;
      await pin.save();
      console.log(pin);
      return res.status(200).send(pin);
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  } catch (error) {
    res.status(500).send({ message: `Pin router error ${error.message}` });
  }
}
