var fs = require('fs');
var merge = require('object-assign');
var Promise = require('bluebird');
var format = require('util').format;
var addEntry = require('./addEntry');

/**
 * @typedef {Object} ChildCompilerConfig
 * @property {Object} options
 * @property {string} [options.name='ChildCompiler']
 * @property {Object} [options.output] Output options. By default taken from parent compilation.
 * @property {Object} [options.context] The base directory for resolving stuff (entries, loaders).
 * @see http://webpack.github.io/docs/configuration.html#output
 */

var NS = fs.realpathSync(__dirname);
var defaultName = 'ChildCompiler';

/**
 * @param {Compilation} compilation
 * @param {ChildCompilerConfig} [config]
 * @constructor
 */
function ChildCompiler(compilation, config) {
  if (this instanceof ChildCompiler == false) {
    return new ChildCompiler(compilation, config);
  }

  var cfg = config || {};
  var compilerName = cfg.name || defaultName;
  var outputOptions = merge({}, compilation.outputOptions, cfg.output || {});

  var compiler = compilation.createChildCompiler(compilerName, outputOptions);
  compiler.context = cfg.context || compilation.compiler.context;

  /**
   * Subcache
   * @see https://github.com/webpack/extract-text-webpack-plugin/blob/master/loader.js#L56
   */
  var subCache = format('%s subcache: %s', compilerName, NS);
  compiler.plugin('compilation', function (compilation) {
    if (compilation.cache) {
      if (!compilation.cache[subCache]) {
        compilation.cache[subCache] = {};
      }
      compilation.cache = compilation.cache[subCache];
    }
  });

  this._compiler = compiler;
}

module.exports = ChildCompiler;

ChildCompiler.defaultName = defaultName;

/**
 * @param {String} entry
 * @param {String} [name='main']
 * @param {String} [context]
 */
ChildCompiler.prototype.addEntry = function(entry, name, context) {
  addEntry(this._compiler, entry, name, context);
};

/**
 * Rejects with error when fatal error occurs.
 * Rejects with compilation if where compilation errors.
 * Resolve with compilation if compilation OK.
 * @returns {Promise<Compilation|Error>}
 */
ChildCompiler.prototype.run = function () {
  var compiler = this._compiler;

  return new Promise(function (resolve, reject) {
    compiler.runAsChild(function (err, entries, compilation) {
      return err ? reject(err) : resolve(compilation);
    });
  });
};

module.exports = ChildCompiler;