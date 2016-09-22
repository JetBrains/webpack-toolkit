var Compiler = require('webpack/lib/Compiler');
var NodeEnvironmentPlugin = require("webpack/lib/node/NodeEnvironmentPlugin");
var WebpackOptionsDefaulter = require("webpack/lib/WebpackOptionsDefaulter");
var WebpackOptionsApply = require('webpack/lib/WebpackOptionsApply');
var extend = require('object-assign');

var defaultConfig = {
  output: {
    filename: '[name].js'
  }
};

/**
 * @param {WebpackConfig} [config]
 * @returns {Compiler}
 */
function createCompiler(config) {
  var options = extend({}, defaultConfig, config || {});

  new WebpackOptionsDefaulter().process(options);

  var compiler = new Compiler();
  compiler.options = options;
  compiler.options = new WebpackOptionsApply().process(options, compiler);

  new NodeEnvironmentPlugin().apply(compiler);
  compiler.applyPlugins("environment");
  compiler.applyPlugins("after-environment");

  return compiler;
}

module.exports = createCompiler;
module.exports.defaultConfig = defaultConfig;