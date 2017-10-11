/**
 * @param {CachedInputFileSystem} fs
 * @param {String} path
 * @returns {Promise<String>}
 */
module.exports = function readFile(fs, path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, function (err, result) {
      err ? reject(err) : resolve(result);
    })
  })
};