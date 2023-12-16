import mongoose from "mongoose";
import User from "../models/userModel.js";
import UserWallet from "../models/userWalletModel.js";
import Campaign from "../models/campaignModel.js";
import {
  CAMPAIGN_STATUS_ACTIVE,
  CAMPAIGN_STATUS_COMPLETED,
  CAMPAIGN_STATUS_PAUSE,
} from "../Constant/campaignStatusConstant.js";

export const createNewWalletHelper = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    //if user exist then check user has wallet or not
    const wallet = await UserWallet.findOne({ user: userId });
    if (wallet) {
      return user;
    }
    let newUserWallet = new UserWallet({
      user: userId,
      username: user.name,
      transactions: [],
    });
    newUserWallet = await newUserWallet.save();
    console.log("User wallet created successfully : ", newUserWallet);

    // after create user's new wallet, add this id to its user
    user.userWallet = newUserWallet._id;
    const updatedUser = await user.save();
    return updatedUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const addNewTransaction = async ({
  toUser,
  amount,
  remark,
  type,
  paymentStatus = true,
}) => {
  try {
    const txId = new mongoose.Types.ObjectId(); //req.query.txId;

    const wallet = await UserWallet.findOne({ user: toUser });
    if (!wallet) {
      console.log("No wallet found!");
      throw new Error("User wallet not found");
    }
    // if payanet status == true add amont in wallet or increment amount
    if (paymentStatus && type == "CREDIT") {
      wallet.balance = Number(wallet.balance) + Number(amount);
    } else if (paymentStatus && type == "DEBIT") {
      wallet.balance = Number(wallet.balance) - Number(amount);
    }
    const newTransaction = {
      _id: txId,
      txId: txId,
      txDate: new Date(),
      txType: type,
      amount: amount,
      success: true, // false -> for not sucess , true for success
      remark: remark,
    };

    wallet.transactions.push(newTransaction);
    const transaction = await wallet.save();
    return transaction;
  } catch (error) {
    throw new Error(error);
  }
};

export const generateRemarkForCraditAmountToScreenOwner = ({
  amount,
  campaignName,
  totalSlotPlayed,
  rentPerSlot,
  screenName,
}) => {
  return `Rs. ${amount} has been Credited for campaign ${campaignName} which is playing on screen ${screenName}.  Total slot played ${totalSlotPlayed} times whose Rent per slot Rs. ${rentPerSlot}`;
};

export const generateRemarkForCraditAmountToAlly = ({
  amount,
  campaignName,
  totalSlotPlayed,
  totalSlotBooked,
  rentPerSlot,
  screenName,
}) => {
  return `Rs. ${amount} Credit for campaign ${campaignName}. You have booked total slot ${totalSlotBooked} and played only ${totalSlotPlayed} whose Rent per slot Rs. ${rentPerSlot} which plays on the screen ${screenName}.`;
};

export const generateRemarkForDabitOnCreateCampaign = ({
  amount,
  campaignName,
  rentPerSlot,
  screenName,
}) => {
  return `Rs. ${amount} Dabit for campaign ${campaignName}. You have booked total slot ${totalSlotBooked} whose Rent per slot Rs. ${rentPerSlot} which plays on the screen ${screenName}.`;
};

export const generateRemarkForWalletRecharge = (amount) => {
  return `Recharge wallet with Rs. ${amount}`;
};

export const addTransactionEventDayOnTheBasicOfDailyPlayedCampaign =
  async () => {
    try {
      const campaigns = await Campaign.find({
        status: { $in: [CAMPAIGN_STATUS_ACTIVE, CAMPAIGN_STATUS_PAUSE] },
        isDefaultCampaign: false,
      });

      for (let campaign of campaigns) {
        // for each camapign we need to chack totalSlotPlayed today
        let totalSlotPlayedPerDay = campaign.slotPlayedPerDay;
        if (totalSlotPlayedPerDay >= campaign.slotPerDay) {
          // sent amount of per day campaign charge to play on that screen;
          const transaction = await addNewTransaction({
            toUser: campaign.master, //
            amount: campaign.rentPerDay,
            remark: generateRemarkForCraditAmountToScreenOwner({
              amount: campaign.rentPerDay,
              campaignName: campaign.campaignName,
              totalSlotPlayed: campaign.totalSlotBooked,
              rentPerSlot: campaign.rentPerSlot,
              screenName: campaign.screenName || "Screen name",
            }),
            type: "CREDIT",
            paymentStatus: true,
          });
          campaign.slotPlayedPerDay = 0;
          // now check remainingSlots <=0 then chnage campaign status as completed
          if (campaign.remainingSlots <= 0) {
            campaign.status = CAMPAIGN_STATUS_COMPLETED;
          }
        }
      }
    } catch (error) {}
  };
