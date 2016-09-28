var path = require('path');
var dirname = path.dirname;
var Promise = require('bluebird');
var MemoryFileSystem = require('memory-fs');

/**
 * Promisified memory-fs.
 * @param {Object|MemoryFileSystem} [data]
 * @constructor
 */
function PromisifiedMemoryFileSystem(data) {
  if (this instanceof PromisifiedMemoryFileSystem == false) {
    return new PromisifiedMemoryFileSystem(data);
  }

  this.fs = (data instanceof MemoryFileSystem) ? data : new MemoryFileSystem(data);
}

module.exports = PromisifiedMemoryFileSystem;

/**
 * @this {{fs:MemoryFileSystem, method:String, resolveWithFirstParam:Boolean}}
 * @returns {Promise}
 */
function callPromisified() {
  var fs = this.fs;
  var method = fs[this.method];
  var resolveWithFirstParam = typeof this.resolveWithFirstParam == 'boolean' ? this.resolveWithFirstParam : false;
  var args = Array.prototype.slice.call(arguments);

  return new Promise(function (resolve, reject) {
    var handler = function (err, result) {
      if (resolveWithFirstParam && err !== null) {
        return resolve(err);
      } else {
        return err ? reject(err) : resolve(result);
      }
    };

    method.apply(fs, args.concat([handler]));
  });
}

PromisifiedMemoryFileSystem.prototype.exists = function(path) {
  return callPromisified.call({method: 'exists', resolveWithFirstParam: true, fs: this.fs}, path);
};

PromisifiedMemoryFileSystem.prototype.stat = function (path) {
  return callPromisified.call({method: 'stat', fs: this.fs}, path);
};

PromisifiedMemoryFileSystem.prototype.readFile = function(path, encoding) {
  return callPromisified.call({method: 'readFile', fs: this.fs}, path, encoding);
};

PromisifiedMemoryFileSystem.prototype.readdir = function(path) {
  return callPromisified.call({method: 'readdir', fs: this.fs}, path);
};

PromisifiedMemoryFileSystem.prototype.mkdir = function(path) {
  return callPromisified.call({method: 'mkdir', fs: this.fs}, path);
};

PromisifiedMemoryFileSystem.prototype.mkdirp = function(path) {
  return callPromisified.call({method: 'mkdirp', fs: this.fs}, path);
};

PromisifiedMemoryFileSystem.prototype.rmdir = function(path) {
  return callPromisified.call({method: 'rmdir', fs: this.fs}, path);
};
PromisifiedMemoryFileSystem.prototype.unlink = function(path) {
  return callPromisified.call({method: 'unlink', fs: this.fs}, path);
};

PromisifiedMemoryFileSystem.prototype.readlink = function(path) {
  return callPromisified.call({method: 'readlink', fs: this.fs}, path);
};

PromisifiedMemoryFileSystem.prototype.writeFile = function(path, content, encoding) {
  return callPromisified.call({method: 'writeFile', fs: this.fs}, path, content, encoding);
};

PromisifiedMemoryFileSystem.prototype.join = MemoryFileSystem.prototype.join;
PromisifiedMemoryFileSystem.prototype.normalize = MemoryFileSystem.prototype.normalize;
PromisifiedMemoryFileSystem.prototype.createReadStream = MemoryFileSystem.prototype.createReadStream;
PromisifiedMemoryFileSystem.prototype.createWriteStream = MemoryFileSystem.prototype.createWriteStream;

/**
 * @param {String} path
 * @param {String} [content='']
 * @param {String} [encoding='utf-8']
 * @returns {Promise}
 */
PromisifiedMemoryFileSystem.prototype.writep = function (path, content, encoding) {
  var mkdirp = this.mkdirp.bind({method: 'mkdirp', fs: this.fs});
  var writeFile = this.writeFile.bind({method: 'writeFile', fs: this.fs});
  var content = typeof content == 'string' ? content : '';
  var encoding = encoding || 'utf-8';

  return mkdirp(dirname(path)).then(function () {
    return writeFile(path, content, encoding);
  });
};

/**
 * @returns {Promise}
 */
PromisifiedMemoryFileSystem.prototype.purge = function() {
  try {
    this.fs.data = {};
  } catch (e) {
    return Promise.reject(e);
  }

  return Promise.resolve();
};