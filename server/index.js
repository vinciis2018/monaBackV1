import express from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";

import userRouter from "./routers/userRouter.js";

const app = express();
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const url = process.env.DB_URL;
console.log("url : ", url);
mongoose.connect(url);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(express.static("public"));

//routers
app.use("/api/users", userRouter);

const __dirname = path.resolve();
app.use("/api/static", express.static(path.join(__dirname, "public")));

app.use(express.static(path.join(__dirname, "/client/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/client/build/index.html"))
);
app.get("/", (req, res) => {
  res.send("Server is ready");
});
app.use((err, req, res, next) => {
  console.log(
    "This error middle ware function called when error oocured : ",
    err.message
  );
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT;
const host = process.env.HOST_URL;
app.listen(port, async () => {
  console.log(`Server at ${host}${port}`);
});
