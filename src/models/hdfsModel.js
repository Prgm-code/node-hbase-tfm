const fs = require('fs');
const util = require('util');
const stream = require('stream');
const WebHDFS = require('webhdfs');
const pipeline = util.promisify(stream.pipeline);

const hdfs = WebHDFS.createClient({
  user: 'hadoop',
  host: 'master',
  port: 50070,
  path: '/webhdfs/v1'
});

// Leer archivo
const read = (path, response) => {
  const remoteFileStream = hdfs.createReadStream(path);

  return new Promise((resolve, reject) => {
    remoteFileStream.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    remoteFileStream.on('end', () => {
      resolve();
    });

    remoteFileStream.pipe(response);
  });
};


// Escribir archivo

const write = (dataStream, remoteFilePath) => {
  
  console.log('remoteFilePath',remoteFilePath);  
  return new Promise((resolve, reject) => {
     const remoteFileStream = hdfs.createWriteStream(remoteFilePath);
     dataStream.pipe(remoteFileStream);
     remoteFileStream.on('error', (error) => {
         console.error(error);
         reject(error);
     });
     remoteFileStream.on('finish', () => {
         resolve();
     });
   });
 };
 

// Crear directorio
const mkdir = async (path) => {
  console.log(path);
  return new Promise((resolve, reject) => {
    hdfs.mkdir(path, function(error) {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};



// Eliminar archivo
const remove = async (path) => {

   return await new Promise((resolve, reject) => {
      hdfs.rmdir(path, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  

// Listar directorio
const list = async (path) => {
  
   return await new Promise((resolve, reject) => {
      hdfs.readdir(path, (err, files) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(files);
          resolve(files);
        }
      });
    });

  };






module.exports = { read, write, remove, list, mkdir };

