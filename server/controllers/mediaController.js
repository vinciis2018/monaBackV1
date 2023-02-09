import Media from "../modles/mediaModel.js";

// add new media
export async function AddNewMedia(req, res) {
  try {
    const media = req.body;
    const mediaData = new Media({
      cid: media.cid,
      owner: media?.owner || req.user.defaultWallet, //v updated by me
      fileUrl: `https://ipfs.io/ipfs/${media.cid}`,
      //   userId: media.userId, // old code
      userId: req.user._id, //v
    });

    const newMedia = await mediaData.save();
    return res.status(201).send(newMedia);
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}

// get all media
export async function getAllMedia(req, res) {
  try {
    const allMedia = await Media.find();
    if (!allMedia) return res.status(404).send({ message: "No media found" });
    return res.status(200).send(allMedia);
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}

// get Media data by cid
export async function getMediaByCid(req, res) {
  try {
    const media = await Media.findOne({ cid: req.params.cid });
    if (!media) return res.status(404).send({ message: "No media found" });
    return res.status(200).send(media);
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}

// get all media by user id
export async function getAllMediaByUserId(req, res) {
  try {
    const myMedia = await Media.find({ userId: req.params.id });
    //const medias = [...myMedia];  //v no need of this line

    if (!myMedia) return res.status(404).send({ message: "No media found" });
    return res.status(200).send(myMedia);
  } catch (error) {
    res.status(500).send({ message: `Media router error ${error.message}` });
  }
}
