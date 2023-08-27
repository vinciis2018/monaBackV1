import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const brandSchema = new mongoose.Schema(
  {
    brandName: { type: String },
    tagline: { type: String },
    address: { type: String },
    brandDetails: {
      website: { type: String },
      aboutBrand: { type: String },
      logo: {
        type: String,
        default:
          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.c6ASmT7d2qYobP4OPwAxVgAAAA%26pid%3DApi&f=1",
      },
      images: [{ type: String }],
      phone: { type: String },
      email: { type: String },
      instagramId: { type: String },
      facebookId: { type: String },
    },
    brandCategory: { type: String }, // restaurant/grocerry
    brandType: { type: String }, // online/offline/both

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reward" }],
    services: [{
      name: { type: String },
      image: { type: String },
      description: { type: String },
    }],
    gigs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gig" }],
    additionalInfo: {},
    ratings: { type: Number },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
