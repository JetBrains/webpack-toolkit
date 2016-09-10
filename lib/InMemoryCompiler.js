var path = require('path');
var webpack = require('webpack');
var MemoryFileSystem = require('memory-fs');
var mergeWebpackConfig = require('webpack-merge');
var Promise = require('bluebird');
var extend = require('object-assign');

var defaultConfig = {
  inputFS: false
};

var defaultWebpackConfig = {
  context: process.cwd(),
  output: {
    path: path.resolve(process.cwd(), 'build')
  }
};

/**
 * @param {Object} [webpackConfig=InMemoryCompiler.defaultWebpackConfig]
 * @param {Object} [config=InMemoryCompiler.defaultConfig]
 * @constructor
 */
function InMemoryCompiler(webpackConfig, config) {
  if (this instanceof InMemoryCompiler == false) {
    return new InMemoryCompiler(webpackConfig, config);
  }

  var cfg = extend({}, defaultConfig, config || {});

  var webpackCfg = mergeWebpackConfig(defaultWebpackConfig, webpackConfig || {});

  // Fix Windows issue with context == '/'
  webpackCfg.context = path.resolve(webpackCfg.context);

  var compiler = webpack(webpackCfg);
  var fs = new MemoryFileSystem();

  if (cfg.inputFS) {
    /** @type {MemoryFileSystem} */
    compiler.inputFileSystem = fs;
    compiler.resolvers.normal.fileSystem = fs;
    compiler.resolvers.context.fileSystem = fs;
  }

  compiler.outputFileSystem = fs;

  this.inputFileSystem = compiler.inputFileSystem;
  this.outputFileSystem = compiler.outputFileSystem;
  this._compiler = compiler;
}

module.exports = InMemoryCompiler;

InMemoryCompiler.defaultConfig = defaultConfig;
InMemoryCompiler.defaultWebpackConfig = defaultWebpackConfig;

/**
 * @param {String} filepath
 * @param {String} [content='']
 * @returns {Promise}
 */
InMemoryCompiler.prototype.write = function (filepath, content) {
  var resolvedPath = path.resolve(filepath);
  var folder = path.dirname(resolvedPath);
  var mkdirp = Promise.promisify(this.inputFileSystem.mkdirp, {context: this.inputFileSystem});
  var write = Promise.promisify(this.inputFileSystem.writeFileSync, {context: this.inputFileSystem});

  return mkdirp(folder)
    .then(write(resolvedPath, typeof content == 'string' ? content : '', 'utf-8'))
};

/**
 * @param {String} filepath
 * @param {String} [content='']
 * @returns {void}
 */
InMemoryCompiler.prototype.writeSync = function(filepath, content) {
  var resolvedPath = path.resolve(filepath);
  var folder = path.dirname(resolvedPath);

  this.inputFileSystem.mkdirpSync(folder);
  this.inputFileSystem.writeFileSync(resolvedPath, typeof content == 'string' ? content : '', 'utf-8');
};

/**
 * @returns {Promise<Compilation>}
 */
InMemoryCompiler.prototype.run = function() {
  var compiler = this._compiler;

  return new Promise(function (resolve, reject) {
    compiler.run(function (err, stats) {
      if (err) {
        return reject(err);
      }

      var compilation = stats && stats.compilation;
      var hasErrors = Boolean(compilation.errors && compilation.errors.length);

      if (hasErrors) {
        var errorDetails = compilation.errors.map(function (error) {
          return error.message + (error.error ? ':\n' + error.error : '');
        }).join('\n');

        reject(new Error('InMemoryCompiler compilation failed: %s', errorDetails));
      } else {
        resolve(compilation);
      }
    });
  });
};