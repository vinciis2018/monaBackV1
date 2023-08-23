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

const creatorSchema= new mongoose.Schema(
  {
    creatorName: { type: String },
    creatorType: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    socialId: [{
      profile: { type: String },
      platform: { type: String },
      parameters: [{
        name: { type: String },
        value: { type: Number }
      }],
      link: { type: String },
    }],
    services: [{
      type: { type: String },
      rate: { type: Number },
      details: { type: String },
    }],
    myMedia: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
    gigs: [{ type: mongoose.Schema.Types.ObjectId, ref: "GiG" }],
    about: { type: String },
    brandsWorkedWith: [{ type: String }],
    creatorDetails: {
      averageResponseTime: { type: Number },
      expertIn: [{ type: String }],
      achievements: [{ type: String }],
      sampleWorkLinks: [{type: String }],
    },
    niche: {
      industry: [{ type: String }],
      location: [{ type: String }],
    },
    additionalInfo: {},
    tags: [{ type: String }],
    ratings: { type: Number },
    reviews: [reviewSchema],

  },
  {
    timestamps: true,
  }
);

const Creator = mongoose.model("Creator", creatorSchema);

export default Creator;
