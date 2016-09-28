var matcher = require('webpack/lib/ModuleFilenameHelpers').matchObject;

/**
 * @param {Object} loadersOptions Loaders options object (preLoaders, loaders, postLoaders)
 * @param {String} request
 * @see http://webpack.github.io/docs/configuration.html#module-loaders
 */
module.exports = function findMatchedLoaders(loadersOptions, request) {
  var matched = [];

  if (loadersOptions) {
    matched = matched.concat(
      loadersOptions.preLoaders || [],
      loadersOptions.loaders || [],
      loadersOptions.postLoaders || []
    );
  }

  return matched.filter(function(loaderConfig) {
    return matcher(loaderConfig, request);
  });
};