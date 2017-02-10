var matcher = require('webpack/lib/ModuleFilenameHelpers').matchObject;
var COMPILER_VERSION = require('webpack/package.json').version;

/**
 * @param {Object} loadersConfig Loaders options object (preLoaders, loaders, postLoaders)
 * @param {String} request
 * @see http://webpack.github.io/docs/configuration.html#module-loaders
 */
module.exports = function findMatchedLoaders(loadersConfig, request) {
  var loaders;

  switch (parseInt(COMPILER_VERSION)) {
    case 1:
      loaders = [].concat(
        loadersConfig.postLoaders || [],
        loadersConfig.loaders || [],
        loadersConfig.preLoaders || []
      );
      break;

    case 2:
      loaders = loadersConfig.rules;
      break;

    case -1:
    default:
      // In case of unknown API version return empty array instead of throwing exception
      loaders = [];
      break;
  }

  return loaders.filter(function(loaderConfig) {
    return matcher(loaderConfig, request);
  });
};
