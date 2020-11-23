const fs = require("fs");
function moveFileLocation(fromPath, toPath) {
  return new Promise(function (resolve, reject) {
    fs.rename(fromPath, toPath, function (err) {
      if (err) {
        reject(new Error("File did not move."));
        throw err;
      } else {
        resolve();
      }
    });
  });
}
module.exports = moveFileLocation;
