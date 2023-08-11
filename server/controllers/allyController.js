import Ally from "../models/allyModel";
import User from "../models/userModel";


export async function getAlly(req, res) {
  try {
    return res.status(200).send();
  } catch (error) {
    res.status(500).send({ message: `Pin router error ${error.message}` });
  }
}

export async function addNewAlly(req, res) {
  try {
     const allyId = new mongoose.Types.ObjectId();
     const user = await User.findOne({ _id: req.user._id });
     if (!user) {
      return res
        .status(404)
        .send({ message: "User Not Found! DO login again" });
    }

    if (user.ally) {
      const ally = await Ally.findOne({ _id: user.ally });
      return res.status(200).send(ally);
    } else {
      const ally = new Ally({ 
        _id: allyId,
        allyName: "AllyName" || req.body.allyName,
        user: user._id,
        socialId: [{
          profile: "user_name",
          platform: "instagram",
          parameter: [{
            name: "followers",
            value: "1203",
          }],
          link: "instalink",
        }],
        myMedia: [],
        gigs: [],
        about: {},
        brandsWorkedWith: [],
        allyDetails: {},
        additionalInfo: {},
        reviews: [],
        ratings: 0
       });
  
       user.ally.push(allyId);
  
       await user.save();
       const createdAlly = await ally.save();
      
      return res.status(200).send(createdAlly);
    }
  } catch (error) {
    return res.status(500).send({ message: `Ally router error ${error.message}` });
  }
}