import Campaign from "../models/campaignModel.js";
import UserWallet from "../models/userWalletModel.js";
import Screen from "../models/screenModel.js";
import {
  addNewTransaction,
  generateRemarkForCraditAmountToAlly,
  generateRemarkForCraditAmountToScreenOwner,
} from "./userWalletHelper.js";
import {
  CAMPAIGN_STATUS_ACTIVE,
  CAMPAIGN_STATUS_COMPLETED,
  CAMPAIGN_STATUS_DELETED,
  CAMPAIGN_STATUS_PAUSE,
} from "../Constant/campaignStatusConstant.js";

export const createNewCampaignHepler = async ({
  data,
  screen,
  media,
  user,
}) => {
  try {
    const cid = media.media.split("/")[4];
    console.log("createNewCampaignHepler called! : ", data);

    const screenOwnerWallet = await UserWallet.findOne({ user: screen.master });
    if (!screenOwnerWallet) {
      throw new Error("Screen owner has no wallet");
    }

    const newCampaign = new Campaign({
      screen: screen._id,
      screenName: screen.name || "screen name",
      media: media._id,
      cid: cid,
      thumbnail: media.thumbnail,
      campaignName: data.campaignName || "campaign Name",
      video: media.media,
      ally: user._id,
      master: screen.master,
      isSlotBooked: false,
      paidForSlot: false,
      rentPerDay: screen.rentPerDay,
      slotPerDay: screen.slotPerDay,
      totalSlotBooked: data.totalSlotBooked || 0,
      remainingSlots: data.totalSlotBooked || 0,
      rentPerSlot: screen.rentPerSlot,
      totalAmount: data.totalSlotBooked * screen.rentPerSlot,
      vault: data.totalSlotBooked * screen.rentPerSlot,
      brandWalletAddress: user.userWallet, // money deduct or refund onthis wallet address
      masterWalletAddress: screenOwnerWallet._id, //on campaign complete add totalAmount in this screen owner wallet

      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(),
      startTime: data.startTime || new Date(),
      endTime: data.endTime || new Date(),
      isDefaultCampaign: data.isDefaultCampaign,
      status: data.status,
      screenAddress: screen.screenAddress,
      districtCity: screen.districtCity,
      stateUT: screen.stateUT,
      country: screen.country,
    });

    const campaign = await newCampaign.save();
    console.log("campaign created successfully!");
    return campaign;
  } catch (error) {
    throw new Error(error);
  }
};

export const changeCampaignStatusAsDeleted = async (campaign) => {
  try {
    const screen = await Screen.findById(campaign.screen);
    if (campaign.remainingSlots > 0 && campaign.isDefaultCampaign == false) {
      const totalPlayedCampaign =
        campaign.totalSlotBooked - campaign.remainingSlots;
      const totalAmountPaidToScreen =
        totalPlayedCampaign * campaign.rentPerSlot;
      const totalAmountReturnToBrand =
        campaign.remainingSlots * campaign.rentPerSlot;

      const addAmountInscreenOwer = await addNewTransaction({
        toUser: campaign.master, //
        amount: totalAmountPaidToScreen,
        remark: generateRemarkForCraditAmountToScreenOwner({
          amount: totalAmountPaidToScreen,
          campaignName: campaign.campaignName,
          totalSlotPlayed: totalPlayedCampaign,
          rentPerSlot: campaign.rentPerSlot,
          screenName: screen.name,
        }),
        type: "DEBIT",
        paymentStatus: true,
      });

      console.log("addAmountInscreenOwer  when campaign deleted : ");

      const returnAmountToAllyForRemainingSlot = await addNewTransaction({
        toUser: campaign.ally, //
        amount: totalAmountReturnToBrand,
        remark: generateRemarkForCraditAmountToAlly({
          amount: totalAmountReturnToBrand,
          campaignName: campaign.campaignName,
          totalSlotBooked: campaign.totalSlotBooked,
          totalSlotPlayed: totalPlayedCampaign,
          rentPerSlot: campaign.rentPerSlot,
          screenName: screen.name,
        }),
        type: "CREDIT",
        paymentStatus: true,
      });

      console.log("returnAmountToAllyForRemainingSlot  when campaign deleted");

      campaign.status = CAMPAIGN_STATUS_DELETED;

      const updatedCampaign = await campaign.save();
      // NOW REMOVE THIS CAMPAIGN SCREEN
      const updatedScreen = await Screen.updateOne(
        { _id: campaign.screen },
        { $pull: { campaigns: updatedCampaign._id } }
      );
      console.log("Also camapign removed from screen");
      return updatedCampaign;
    } else {
      campaign.status = CAMPAIGN_STATUS_DELETED;

      const updatedCampaign = await campaign.save();
      // NOW REMOVE THIS CAMPAIGN SCREEN
      const updatedScreen = await Screen.updateOne(
        { _id: campaign.screen },
        { $pull: { campaigns: updatedCampaign._id } }
      );
      console.log("Also camapign removed from screen");
      return updatedCampaign;
    }
  } catch (error) {
    console.log("Error in changeCampaignStatusAsDeleted : ", error);
    throw new Error(error);
  }
};

export const changeCampaignStatusAsPause = async (campaign) => {
  try {
    campaign.status = CAMPAIGN_STATUS_PAUSE;
    const updatedCampaign = await campaign.save();
    console.log("changeCampaignStatusAsPause : ", updatedCampaign.status);
    return updatedCampaign;
  } catch (error) {
    console.log("changeCampaignStatusAsPause : ", error);
    throw new Error(error);
  }
};

export const changeCampaignStatusAsActive = async (campaign) => {
  try {
    campaign.status = CAMPAIGN_STATUS_ACTIVE;
    const updatedCampaign = await campaign.save();
    console.log("changeCampaignStatusAsActive : ", updatedCampaign.status);
    return updatedCampaign;
  } catch (error) {
    console.log("changeCampaignStatusAsActive : ", error);
    throw new Error(error);
  }
};

export const changeCampaignStatusAsCompleted = async (campaign) => {
  try {
    campaign.status = CAMPAIGN_STATUS_COMPLETED;
    const updatedCampaign = await campaign.save();
    console.log("changeCampaignStatusAsCompleted : ", updatedCampaign.status);
    // NOW REMOVE THIS CAMPAIGN SCREEN
    const updatedScreen = await Screen.updateOne(
      { _id: campaign.screen },
      { $pull: { campaigns: updatedCampaign._id } }
    );
    console.log("Also camapign removed from screen");

    return updatedCampaign;
  } catch (error) {
    console.log("changeCampaignStatusAsCompleted : ", error);
    throw new Error(error);
  }
};

export function getAllCampaignStatus(campaigns, userId) {
  let dd = campaigns?.reduce(
    (accum, current) => {
      if (
        current.status === CAMPAIGN_STATUS_ACTIVE ||
        current.status === CAMPAIGN_STATUS_PAUSE
      ) {
        accum.active++;
      } else if (current.status === CAMPAIGN_STATUS_COMPLETED) {
        accum.completed++;
      } else if (current.status === CAMPAIGN_STATUS_DELETED) {
        accum.deleted++;
      } else {
        accum.pending++;
      }
      if (current.ally == userId) {
        accum.myCampaigns++;
      } else {
        accum.othersCampaigns++;
      }

      return accum;
    },
    {
      active: 0,
      pending: 0,
      deleted: 0,
      completed: 0,
      myCampaigns: 0,
      othersCampaigns: 0,
    }
  );

  return dd;
}
