import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  cid: { type: String, required: true },
  owner: { type: String, required: true },
  fileUrl: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  mediaType: { type: String, enum: ["Video", "Image"], default: "Video" }, //v
});

const Media = mongoose.model("Media", mediaSchema);

export default Media;
