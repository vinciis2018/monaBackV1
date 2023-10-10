import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    avatar: {
      type: String,
      default:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.c6ASmT7d2qYobP4OPwAxVgAAAA%26pid%3DApi&f=1",
    },

    phone: { type: String, default: "99999999", required: true },
    address: { type: String, default: "address", required: true },
    districtCity: { type: String, default: "district/city", required: true },
    municipality: { type: String, default: "municipality", required: true },
    pincode: { type: Number, default: "111111", required: true },
    stateUt: { type: String, default: "state/UT", required: true },
    country: { type: String, default: "country", required: true },

    pwaInstalled: { type: Boolean, default: false },
    isItanimulli: { type: Boolean, default: false, required: true },
    isViewer: { type: Boolean, default: true, required: true },

    isMaster: { type: Boolean, default: false, required: true },
    master: [{ type: mongoose.Schema.Types.ObjectId, ref: "Master" }],

    isCreator: { type: Boolean, default: false, required: true },
    creator: [{ type: mongoose.Schema.Types.ObjectId, ref: "Creator" }],

    isBrand: { type: Boolean, default: false, required: true },
    brand: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],

    defaultWallet: { type: String },

    wallets: [{ type: String }],

    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }],

    screensSubscribed: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Screen" },
    ],

    screensLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }],

    screensFlagged: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }],

    medias: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],

    mediasLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],

    mediasFlagged: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],

    mediasViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],

    pleasMade: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plea" }],

    myMedia: [{ type: String }], // here we store cid when we create media

    alliedScreens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }],
    rewardCoupons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
