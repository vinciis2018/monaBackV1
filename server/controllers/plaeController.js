import Plea from "../models/pleaModel.js";
import Screen from "../models/screenModel.js";
import User from "../models/userModel.js";
import CampaignForMultipleScreen from "../models/campaignForMultipleScreenModel.js";

export async function getPleaRequestListByUserID(req, res) {
  try {
    console.log("getPleaRequestListByUserID called!");
    const screenOwnerUserId = req.params.id;
    const pleas = await Plea.find({ to: screenOwnerUserId });
    return res.status(200).send(pleas);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Plea router error ${error.message}` });
  }
}
export async function getPleaRequestListByScreenID(req, res) {
  try {
    const screenId = req.params.id;
    const pleas = await Plea.find({ screen: screenId });
    return res.status(200).send(pleas);
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Plea router error ${error.message}` });
  }
}

export async function giveAccessToCampaignAllyPlea(req, res) {
  try {
    console.log("giveAccessToCampaignAllyPlea called!");
    const pleaId = req.params.id;
    const plea = await Plea.findById(pleaId);
    const campaignForMultipleScreen = await CampaignForMultipleScreen.findById(
      plea.campaignForMultipleScreen
    );
    console.log("plea  ", plea);

    const screen = await Screen.findOne({ _id: plea.screen });
    console.log("screen  ", screen);

    const master = await User.findOne({
      _id: plea.to,
      // defaultWallet: plea.to
    });
    const user = await User.findOne({
      _id: plea.from,
      // defaultWallet: plea.from
    });
    const remark = `${user.name} user has been given an Campaign Ally access for ${screen.name} screen from ${master.name} user`;

    console.log("granting ally access");
    plea.status = true;
    plea.remarks.push(remark);
    // const updatedScreen = await Screen.updateOne(
    //   { _id: plea.screen },
    //   { $pull: { pleas: plea._id } }
    // );
    // const updatedUser = await User.updateOne(
    //   { _id: plea.from },
    //   { $pull: { pleasMade: plea._id } }
    // );
    await plea.save();
    campaignForMultipleScreen.acceptedScreens.push(plea.screen);
    await campaignForMultipleScreen.save();
    return res
      .status(200)
      .send({ message: "successfull given permition", plea });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Pleas router error ${error.message}` });
  }
}
export async function rejectCampaignAllyPlea(req, res) {
  try {
    console.log("giveAccessToCampaignAllyPlea called!");
    const pleaId = req.params.id;
    const plea = await Plea.findById(pleaId);
    const campaignForMultipleScreen = await CampaignForMultipleScreen.findById(
      plea.campaignForMultipleScreen
    );
    console.log("plea  ", plea);

    const screen = await Screen.findOne({ _id: plea.screen });
    console.log("screen  ", screen);

    const master = await User.findOne({
      _id: plea.to,
      // defaultWallet: plea.to
    });
    const user = await User.findOne({
      _id: plea.from,
      // defaultWallet: plea.from
    });
    const remark = `${user.name} user has been rejected an Campaign Ally access for ${screen.name} screen from ${master.name} user`;

    plea.status = false;
    plea.reject = true;
    plea.remarks.push(remark);
    // const updatedScreen = await Screen.updateOne(
    //   { _id: plea.screen },
    //   { $pull: { pleas: plea._id } }
    // );
    // const updatedUser = await User.updateOne(
    //   { _id: plea.from },
    //   { $pull: { pleasMade: plea._id } }
    // );
    await plea.save();
    campaignForMultipleScreen.rejectedScreens.push(plea.screen);
    await campaignForMultipleScreen.save();
    console.log("rejected ally access");
    return res
      .status(200)
      .send({ message: "successfull given permition", plea });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Pleas router error ${error.message}` });
  }
}

export async function xxx(req, res) {
  try {
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Campaign router error ${error.message}` });
  }
}
