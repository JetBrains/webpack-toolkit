var matcher = require('webpack/lib/ModuleFilenameHelpers').matchObject;

/**
 * @param {Object} loadersConfig Loaders options object (preLoaders, loaders, postLoaders)
 * @param {String} request
 * @see http://webpack.github.io/docs/configuration.html#module-loaders
 */
module.exports = function findMatchedLoaders(loadersConfig, request) {
  var loaders = [].concat(
    loadersConfig.postLoaders || [],
    loadersConfig.loaders || loadersConfig.rules || [],
    loadersConfig.preLoaders || []
  );

  return loaders.filter(function(loaderConfig) {
    return matcher(loaderConfig, request);
  });
};
