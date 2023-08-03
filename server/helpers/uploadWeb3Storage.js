import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import * as Name from "w3name";
import { generateRandonNumberOfLengthN } from "../utils/utils.js";

const __dirname = path.resolve();
// if using in production
// const __dirname = path.resolve() + "/monaBackV1";
// because in ubuntu path.resolve() = /home/ubuntu

ffmpeg.setFfmpegPath(ffmpegStatic);

const token = process.env.REACT_APP_WEB3_STORAGE_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczQTg1YzJhQTVmNzU1ZTM4MUUxODhmYkI2ZTg3M0E3MEJGRUQ2RjAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjMxODkwNjgyOTEsIm5hbWUiOiJtb25hX2JldGEifQ.pONwiaib6R_lPL2bop4cTgk5-Z2Otf4723aDJjEYDLY";
// console.log("token : ", token);
const storage = new Web3Storage({ token });

export async function uploadWeb3File(req, res) {

  console.log("__dirname : ", __dirname);
  const dirName = generateRandonNumberOfLengthN();
  fs.mkdirSync(path.join(__dirname, "server", "jsonFiles", dirName));

  const jsonData = '{"data": [{ "key1": "value1", "key2": "value2"}]}';

  const jsonObj = JSON.parse(jsonData);

  const jsonContent = JSON.stringify(jsonObj);
  // console.log(jsonContent);
  console.log("1");

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
  console.log(`Uploading ${files.length} files`);
  const cid = await storage.put(files);
  console.log("Content added with CID:", cid);
  let resp = await storage.get(cid);
  // console.log("response : ", resp);
  const Jsonfiles = await resp?.files() || []; // Web3File[]
  for (const file of Jsonfiles) {
    //getting cid to create new media
    console.log(`${file.cid} ${file.name} ${file.size}`);
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
      console.log("Recursive: Directories Deleted!");
    }
  });

  return {cid};

}


export async function uploadWeb3Name(req, res, next) {

  console.log(req);
  const name = await Name.create();
  console.log(
    "created new name: ", name.toString()
  )
  console.log(name.key);
  const value = `/ipfs/${req.cid}`;
  const revision = await Name.v0(name, value);
  await Name.publish(revision, name.key);

  const latestRevision = await Name.resolve(name);
  console.log('Resolved value:', latestRevision.value);
  // return {cid};

}