import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import * as Name from "w3name";
import { generateRandonNumberOfLengthN } from "../utils/utils.js";
import { __dirname, storage } from "../controllers/imagesToVideoController.js";
// const __dirname = path.resolve();
// if using in production
// const __dirname = path.resolve() + "/monaBackV1";
// because in ubuntu path.resolve() = /home/ubuntu

ffmpeg.setFfmpegPath(ffmpegStatic);

// const token = process.env.REACT_APP_WEB3_STORAGE_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczQTg1YzJhQTVmNzU1ZTM4MUUxODhmYkI2ZTg3M0E3MEJGRUQ2RjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjMxODkwNjgyOTEsIm5hbWUiOiJtb25hX2JldGEifQ.pONwiaib6R_lPL2bop4cTgk5-Z2Otf4723aDJjEYDLY";
// console.log("token : ", token);
// const storage = new Web3Storage({ token });

export async function uploadWeb3File(req, res, next) {

  console.log("__dirname web3 : ", __dirname);
  const dirName = generateRandonNumberOfLengthN();
  fs.mkdirSync(path.join(__dirname, "server", "jsonFiles", dirName));

  // const jsonData = '{"data": [{ "key1": "value1", "key2": "value2"}]}';
  // const jsonData = req.screenLogs.toJSON();

  // console.log(jsonData);

  // const jsonObj = JSON.parse(jsonData);
  const jsonObj = req.screenLogs.toJSON();
  console.log(jsonObj)
  const jsonContent = JSON.stringify(jsonObj);
  console.log("1", jsonContent);

  fs.writeFile(path.join(__dirname, "server", "jsonFiles", dirName, "dataFile.json"),
    jsonContent, "utf8", function (err) {
      if (err) {
        console.log("Error found: ", err);
        return console.log(err);
      }

      console.log("JSON file saved")
    }  
  );
  console.log("2", dirName);

  const files = [];
  const jsonPath = path.join(
    __dirname,
    "server",
    "jsonFiles",
    dirName,
    "dataFile.json"
  );

  const pathFiles = await getFilesFromPath(jsonPath);
  files.push(...pathFiles);
  console.log(`3 Uploading ${files.length} files`);
  const cid = await storage.put(files);
  console.log("4 Content added with CID:", cid);
  let resp = await storage.get(cid);
  // console.log("response : ", resp);
  const Jsonfiles = await resp?.files() || []; // Web3File[]
  for (const file of Jsonfiles) {
    //getting cid to create new media
    console.log(`5 ${file.cid} ${file.name} ${file.size}`);
    // console.log(
    //   "`https://ipfs.io/ipfs/${cid}` : ",
    //   `https://ipfs.io/ipfs/${file.cid}`
    // );
  }

  fs.rm(path.join(__dirname, "server", "jsonFiles", dirName), {
    recursive: true,
  }, (error) => {
    if (error) {
      console.log(error);
    }
    else {
      console.log("6 Recursive: Directories Deleted!");
    }
  });

  req.cid = cid;
  return {cid};

}


export async function createWeb3Name(req, res, next) {
  console.log("A", req.outputFilename);
  let newBytes;
  let newName;
  if (fs.existsSync(req.outputFilename)) {
    // load key
    const myBytes = await fs.promises.readFile(req.outputFilename);
    console.log(myBytes)

    const myName = await Name.from(myBytes);
    newName = myName;
    newBytes = myBytes;
    console.log(newName.toString());
  } else {
    // create and save key
    
    const name = await Name.create();
    console.log(
      "created new name: ", name.toString()
    )
    console.log(name.key);
    const bytes = name.key.bytes;
    await fs.promises.writeFile(req.outputFilename, bytes);
    newBytes = bytes;
    newName = name;
  }

  const value = `/ipfs/${req.cid}`;
  const revision = await Name.v0(newName, value);
  await Name.publish(revision, newName.key);

  const latestRevision = await Name.resolve(newName);
  console.log('Resolved value:', latestRevision.value);
  return (newName.toString(), latestRevision.value);
}


export async function updateWeb3Name() {
  console.log("A", req.outputFilename);
  let newBytes;
  let newName;
  // load key
  const myBytes = await fs.promises.readFile(req.outputFilename);
  console.log(myBytes)

  const myName = await Name.from(myBytes);
  newName = myName;
  newBytes = myBytes;
  console.log(newName.toString());

  const nextValue = `/ipfs/${req.cid}`;
  const revision = await Name.v0(newName, value);
  const nextRevision = await Name.increment(revision, nextValue);
  await Name.publish(nextRevision, newName.key);
  const latestRevision = await Name.resolve(newName);
  console.log('Resolved value:', latestRevision.value);

  return {carName: newName.toString(), latest: latestRevision.value};
}