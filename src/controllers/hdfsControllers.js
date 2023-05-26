const fs = require("fs");
const HdfsModel = require("../models/hdfsModel");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { Readable } = require('stream');

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
    return err;
  }

  return userDirectory;
};

exports.read = async (req, res, next) => {
    const userDirectory = await getUserDirectory(req.headers["x-access-token"]);
    const path = `${userDirectory}/${req.params.path}`;
    try {
      await HdfsModel.read(path, res);
    } catch (error) {
      next(error);
    }
  };

exports.upload = async (req, res, next) => {
    console.log(req.file);
    const file = req.file;
    const token = req.headers["x-access-token"];
    const userDirectory = await getUserDirectory(token);
    const remoteFilePath = `${userDirectory}/${file.originalname}`;
  
    // Crear un stream a partir del Buffer
    const fileStream = Readable.from(file.buffer);
  
    try {
      await HdfsModel.write(fileStream, remoteFilePath);
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
  const userDirectory = await getUserDirectory(req.headers["x-access-token"]);
  const path = `${userDirectory}/${req.params.path}`;
  try {
    await HdfsModel.remove(path);
    res.json({ message: "Archivo eliminado con éxito." });
  } catch (error) {
    next(error);
  }
};
