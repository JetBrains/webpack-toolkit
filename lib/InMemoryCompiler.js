var path = require('path');
var webpack = require('webpack');
var MemoryFileSystem = require('memory-fs');
var mergeWebpackConfig = require('webpack-merge');
var extend = require('object-assign');
var format = require('util').format;
var addEntry = require('./addEntry');

var defaultConfig = {
  inputFS: null,
  outputFS: null
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
  var inputFS = cfg.inputFS || new MemoryFileSystem();
  var outputFS = cfg.outputFS || new MemoryFileSystem();
  var webpackCfg = mergeWebpackConfig(defaultWebpackConfig, webpackConfig || {});

  // Fix Windows issue with context == '/'
  // webpackCfg.context = path.resolve(webpackCfg.context);

  this._compiler = webpack(webpackCfg);

  this.setInputFS(inputFS);
  this.setOutputFS(outputFS);
}

module.exports = InMemoryCompiler;

InMemoryCompiler.defaultConfig = defaultConfig;
InMemoryCompiler.defaultWebpackConfig = defaultWebpackConfig;

/**
 * @returns {Promise<Compilation>}
 */
InMemoryCompiler.prototype.run = function(rejectOnErrors) {
  var shouldRejectOnErrors = typeof rejectOnErrors === 'boolean' ? rejectOnErrors : true;
  var compiler = this._compiler;

  return new Promise(function (resolve, reject) {
    compiler.run(function (err, stats) {
      if (err) {
        return reject(err);
      }

      var compilation = stats && stats.compilation;
      var hasErrors = compilation.errors.length > 0;

      if (hasErrors && shouldRejectOnErrors) {
        var errorDetails = compilation.errors.map(function (error) {
          return error.message + (error.error ? ':\n' + error.error : '');
        }).join('\n');

        return reject(new Error(format('InMemoryCompiler failed: %s', errorDetails)));
      } else {
        return resolve(compilation);
      }
    });
  });
};

/**
 * @param {String} path
 * @param {String} [name='main']
 * @param {String} [context]
 * @returns {InMemoryCompiler}
 */
InMemoryCompiler.prototype.addEntry = function (path, name, context) {
  addEntry(this._compiler, path, name, context);
  return this;
};

/**
 * @param {...Function|Array<Function>} set or array of Webpack plugins
 * @returns {InMemoryCompiler}
 */
InMemoryCompiler.prototype.apply = function() {
  var isArrayOfPlugins = (arguments.length == 1 && Array.isArray(arguments[0]));
  this._compiler.apply.apply(this._compiler, isArrayOfPlugins ? arguments[0] : arguments);
  return this;
};

/**
 * @param {MemoryFileSystem|CachedInputFileSystem} fs
 * @returns {InMemoryCompiler}
 */
InMemoryCompiler.prototype.setInputFS = function (fs) {
  this._compiler.inputFileSystem = fs;
  this._compiler.resolvers.normal.fileSystem = fs;
  this._compiler.resolvers.context.fileSystem = fs;
  return this;
};

/**
 * @param {MemoryFileSystem|CachedInputFileSystem} fs
 * @returns {InMemoryCompiler}
 */
InMemoryCompiler.prototype.setOutputFS = function (fs) {
  this._compiler.outputFileSystem = fs;
  return this;
};