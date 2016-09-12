var fs = require('fs');
var extend = require('object-assign');
var Promise = require('bluebird');
var format = require('util').format;
var addEntry = require('./addEntry');

/**
 * @typedef {Object} ChildCompilerOptions
 * @property {Object} options
 * @property {string} [options.name='Child compiler']
 * @property {string} [options.context] By default taken from parent compilation.
 * @property {Object} [options.output] Output options. By default taken from parent compilation.
 * @see http://webpack.github.io/docs/configuration.html#output
 */

var NS = fs.realpathSync(__dirname);

var defaultName = 'ChildCompiler';

var defaultOutputOptions = {
  filename: '[name].js'
};

/**
 * @param {Compilation} compilation
 * @param {ChildCompilerOptions} [options]
 * @constructor
 */
function ChildCompiler(compilation, options) {
  var opts = options || {};
  var compilerName = opts.name || defaultName;
  var context = opts.context || compilation.compiler.context;
  var outputOptions = extend({}, defaultOutputOptions, compilation.outputOptions, opts.output || {});

  var compiler = compilation.createChildCompiler(compilerName, outputOptions);
  compiler.context = context;
  this._compiler = compiler;

  /**
   * Subcache
   * @see https://github.com/webpack/extract-text-webpack-plugin/blob/master/loader.js#L56
   */
  var subCache = 'ChildCompiler subcache ' + NS + ' ' + opts.name;
  compiler.plugin('compilation', function (compilation) {
    if (compilation.cache) {
      if (!compilation.cache[subCache]) {
        compilation.cache[subCache] = {};
      }
      compilation.cache = compilation.cache[subCache];
    }
  });
}

module.exports = ChildCompiler;

ChildCompiler.defaultName = defaultName;
ChildCompiler.defaultOutputOptions = defaultOutputOptions;

/**
 *
 * @param {String} name
 * @param {String} path
 * @param {String} [context]
 */
ChildCompiler.prototype.addEntry = function(name, path, context) {
  addEntry(this._compiler, name, path, context);
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