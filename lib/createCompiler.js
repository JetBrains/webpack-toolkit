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
  compiler.context = options.context;
  compiler.options = options;

  new NodeEnvironmentPlugin().apply(compiler);

  if(options.plugins && Array.isArray(options.plugins)) {
    compiler.apply.apply(compiler, options.plugins);
  }

  compiler.applyPlugins('environment');
  compiler.applyPlugins('after-environment');
  compiler.options = new WebpackOptionsApply().process(options, compiler);

  return compiler;
}

module.exports = createCompiler;
module.exports.defaultConfig = defaultConfig;