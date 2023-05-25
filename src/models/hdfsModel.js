const fs = require('fs');
const util = require('util');
const stream = require('stream');
const WebHDFS = require('webhdfs');
const pipeline = util.promisify(stream.pipeline);

const hdfs = WebHDFS.createClient({
  user: 'hadoop', // reemplaza con tu usuario
  host: 'master', // reemplaza con tu host
  port: 50070, // reemplaza con tu puerto
  path: '' // reemplaza con tu ruta
});


// Leer archivo
const read = async (path) => {
  const remoteFileStream = hdfs.createReadStream(path);
  let data = '';

  await pipeline(
    remoteFileStream,
    new stream.Writable({
      write(chunk, encoding, callback) {
        data += chunk.toString();
        callback();
      }
    })
  );

  return data;
};

// Escribir archivo
const write = async (localFilePath, remoteFilePath) => {
  const localFileStream = fs.createReadStream(localFilePath);
  const remoteFileStream = hdfs.createWriteStream(remoteFilePath);

  await pipeline(localFileStream, remoteFileStream);
};

// Eliminar archivo
const remove = async (path) => {
  return hdfs.unlink(path, true);
};

// Listar directorio
const list = async (path) => {
  return hdfs.readdir(path);
};

module.exports = { read, write, remove, list };
