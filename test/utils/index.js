var Compiler = require('webpack/lib/Compiler');
var Compilation = require('webpack/lib/Compilation');
var WebpackOptionsDefaulter = require("webpack/lib/WebpackOptionsDefaulter");
var WebpackOptionsApply = require('webpack/lib/WebpackOptionsApply');
var NodeEnvironmentPlugin = require("webpack/lib/node/NodeEnvironmentPlugin");
var NodeJSInputFileSystem = require('enhanced-resolve/lib/NodeJSInputFileSystem');
var CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');
var extend = require('object-assign');

var defaultOptions = {
  output: {
    filename: '[name].js'
  }
};

/**
 * @param {WebpackConfig} [opts]
 * @returns {Compiler}
 */
function createCompiler(opts) {
  var options = extend({}, defaultOptions, opts || {});

  new WebpackOptionsDefaulter().process(options);

  var compiler = new Compiler();
  compiler.options = options;
  compiler.options = new WebpackOptionsApply().process(options, compiler);

  new NodeEnvironmentPlugin().apply(compiler);
  compiler.applyPlugins("environment");
  compiler.applyPlugins("after-environment");

  return compiler;
}

/**
 * @param {WebpackConfig} [opts]
 * @returns {Compilation}
 */
function createCompilation(opts) {
  return new Compilation(createCompiler(opts));
}

function createCachedInputFileSystem() {
  return new CachedInputFileSystem(new NodeJSInputFileSystem, 60000);
}

exports.createCompiler = createCompiler;
exports.createCompilation = createCompilation;
exports.createCachedInputFileSystem = createCachedInputFileSystem;