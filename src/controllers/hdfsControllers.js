const fs = require("fs");
const HdfsModel = require("../models/hdfsModel");
const multer = require("multer");
const upload = multer();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const getUserDirectory = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.sub;
  console.log(userId);

  const userDirectory = `/hdfs/${userId}`;

  try {
    await HdfsModel.mkdir(userDirectory);
  } catch (err) {
    console.log(err);
  }

  return userDirectory;
};

exports.read = async (req, res, next) => {
  const userDirectory = getUserDirectory(req.headers["x-access-token"]);
  const path = `${userDirectory}/${req.params.path}`;
  try {
    const data = await HdfsModel.read(path);
    console.log(data);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

exports.upload = async (req, res, next) => {
  const file = req.file;
  const token = req.headers["x-access-token"];
  const userDirectory = getUserDirectory(token);
  const remoteFilePath = `${userDirectory}/${file.originalname}`;

  try {
    const response = await HdfsModel.write(file.stream, remoteFilePath);
    console.log(response);
    res.status(200).json({ message: "Archivo subido con éxito." });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  const userDirectory = await getUserDirectory(req.headers["x-access-token"]);
  const path = `${userDirectory}`;
  console.log(typeof path);
    try {
        const files = await HdfsModel.list(path);
        res.json({ files });
    } catch (error) {
        next(error);
    }
};


exports.remove = async (req, res, next) => {
  const userDirectory = getUserDirectory(req.headers["x-access-token"]);
  const path = `${userDirectory}/${req.params.path}`;
  try {
    await HdfsModel.remove(path);
    res.json({ message: "Archivo eliminado con éxito." });
  } catch (error) {
    next(error);
  }
};
