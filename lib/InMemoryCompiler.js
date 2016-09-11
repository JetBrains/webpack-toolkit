var path = require('path');
var webpack = require('webpack');
var MemoryFileSystem = require('memory-fs');
var MemoryFileSystemWrapper = require('./MemoryFilesystem');
var mergeWebpackConfig = require('webpack-merge');
var Promise = require('bluebird');
var extend = require('object-assign');

var defaultConfig = {
  inputFS: false
};

var defaultWebpackConfig = {
  context: process.cwd(),
  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: '[name].js'
  }
};

/**
 * @param {WebpackConfig} [webpackConfig=InMemoryCompiler.defaultWebpackConfig]
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
  var fsWrapper = new MemoryFileSystemWrapper(fs);

  if (cfg.inputFS) {
    /** @type {MemoryFileSystem} */
    compiler.inputFileSystem = fs;
    compiler.resolvers.normal.fileSystem = fs;
    compiler.resolvers.context.fileSystem = fs;
  }

  compiler.outputFileSystem = fs;

  this.inputFS = fsWrapper;
  this._compiler = compiler;
}

module.exports = InMemoryCompiler;

InMemoryCompiler.defaultConfig = defaultConfig;
InMemoryCompiler.defaultWebpackConfig = defaultWebpackConfig;

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