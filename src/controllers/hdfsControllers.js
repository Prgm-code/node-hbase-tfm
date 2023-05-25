const fs = require('fs');
const HdfsModel = require('../models/hdfsModel');


exports.read = async (req, res) => {
  const path = req.params.path;
  try {
    const data = await HdfsModel.read(path);
    console.log(data);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

exports.write = async (req, res) => {
  const path = '/hdfs/test';
  const localFilePath = fs.createReadStream('test.txt');
  try {
    await HdfsModel.write(localFilePath, path);
    res.json({ message: 'File written successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

exports.remove = async (req, res) => {
  const path = req.params.path;
  try {
    await HdfsModel.remove(path);
    res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

exports.list = async (req, res) => {
  const path = '/';
  console.log(path);
  try {
    const files = await HdfsModel.list(path);
    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};
