var path = require('path');
var Promise = require('bluebird');

/**
 * Just a handy wrapper over memory-fs.
 * @param {MemoryFileSystem} fs
 * @constructor
 */
function MemoryFilesystem(fs) {
  this.fs = fs;
}

module.exports = MemoryFilesystem;

/**
 * @param {String} filepath
 * @param {String} [content='']
 * @returns {Promise}
 */
MemoryFilesystem.prototype.write = function (filepath, content) {
  var fs = this.fs;
  var resolvedPath = path.resolve(filepath);
  var folder = path.dirname(resolvedPath);
  var mkdirp = Promise.promisify(fs.mkdirp, {context: fs});
  var write = Promise.promisify(fs.writeFileSync, {context: fs});

  return mkdirp(folder)
    .then(write(resolvedPath, typeof content == 'string' ? content : '', 'utf-8'))
};

/**
 * @param {String} filepath
 * @param {String} [content='']
 * @returns {void}
 */
MemoryFilesystem.prototype.writeSync = function(filepath, content) {
  var resolvedPath = path.resolve(filepath);
  var folder = path.dirname(resolvedPath);

  this.inputFileSystem.mkdirpSync(folder);
  this.inputFileSystem.writeFileSync(resolvedPath, typeof content == 'string' ? content : '', 'utf-8');
};