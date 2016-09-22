var Compilation = require('webpack/lib/Compilation');
var createCompiler = require('./createCompiler');

/**
 * @param {WebpackConfig} [config]
 * @see Default config in createCompiler.defaultConfig
 * @returns {Compilation}
 */
module.exports = function createCompilation(config) {
  return new Compilation(createCompiler(config));
};