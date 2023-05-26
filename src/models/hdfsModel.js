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
const read = (path) => {
  const remoteFileStream = hdfs.createReadStream(path);
  let data = '';

  return new Promise((resolve, reject) => {
    pipeline(
      remoteFileStream,
      new stream.Writable({
        write(chunk, encoding, callback) {
          data += chunk.toString();
          callback();
        }
      })
    ).then(() => {
      resolve(data);
    }).catch((error) => {
      console.error(error);
      reject(error);
    });
  });
};


// Escribir archivo
const write = async (dataStream, remoteFilePath) => {
 return new Promise((resolve, reject) => {
        hdfs.createWriteStream(remoteFilePath, function(error, response) {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                dataStream.pipe(response);
                resolve();
            }
        }
    );
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
try {
    await new Promise((resolve, reject) => {
      hdfs.unlink(path, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  catch (error) {
  console.log(error);
    return error;
  }
};

// Listar directorio
const list = async (path) => {
  try {
    const files = await new Promise((resolve, reject) => {
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
    return files;
  } catch (error) {
    console.log(error);
    return error;
  }
};


module.exports = { read, write, remove, list, mkdir };

