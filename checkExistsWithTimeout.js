const fs = require("fs");
const path = require("path");

function checkExistsWithTimeout(filePath, timeout) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      //   watcher.close();

      reject(
        new Error("File does not exist and was not created during the timeout.")
      );
    }, timeout);
    fs.access(filePath, fs.constants.R_OK, function (err) {
      if (!err) {
        clearTimeout(timer);
        // watcher.close();

        resolve();
      }
    });

    var dir = path.dirname(filePath);
    var basename = path.basename(filePath);
    var watcher = fs.watch(dir, function (eventType, filename) {
      if (eventType === "rename" && filename === basename) {
        clearTimeout(timer);
        // watcher.close();

        resolve();
      }
    });
  });
}
module.exports = checkExistsWithTimeout;
