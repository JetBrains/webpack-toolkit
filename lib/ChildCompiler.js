var fs = require('fs');
var extend = require('object-assign');
var Promise = require('bluebird');
var format = require('util').format;
var addEntry = require('./addEntry');

/**
 * @typedef {Object} ChildCompilerOptions
 * @property {Object} options
 * @property {string} [options.name='ChildCompiler']
 * @property {Object} [options.output] Output options. By default taken from parent compilation.
 * @see http://webpack.github.io/docs/configuration.html#output
 */

var NS = fs.realpathSync(__dirname);
var defaultName = 'ChildCompiler';

/**
 * @param {Compilation} compilation
 * @param {ChildCompilerOptions} [options]
 * @constructor
 */
function ChildCompiler(compilation, options) {
  if (this instanceof ChildCompiler == false) {
    return new ChildCompiler(compilation, options);
  }

  var opts = options || {};
  var compilerName = opts.name || defaultName;
  var outputOptions = extend({}, compilation.outputOptions, opts.output || {});

  var compiler = compilation.createChildCompiler(compilerName, outputOptions);

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
 * @param {String} path
 * @param {String} [name='main']
 * @param {String} [context]
 */
ChildCompiler.prototype.addEntry = function(path, name, context) {
  addEntry(this._compiler, path, name, context);
};

/**
 * @returns {Promise<Compilation|Error>}
 */
ChildCompiler.prototype.run = function () {
  var compiler = this._compiler;

  return new Promise(function (resolve, reject) {
    compiler.runAsChild(function (err, entries, compilation) {
      if (err) {
        return reject(err);

      } else if (compilation.errors.length > 0) {
        var errorDetails = compilation.errors.map(function (error) {
          return error.message + (error.error ? ':\n' + error.error : '');
        }).join('\n');

        return reject(
          new Error(format('%s failed: %s', compiler.name, errorDetails))
        );

      } else {
        return resolve(compilation);
      }
    });
  });
};

module.exports = ChildCompiler;