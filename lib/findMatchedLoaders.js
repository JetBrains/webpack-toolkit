var matcher = require('webpack/lib/ModuleFilenameHelpers').matchObject;

/**
 * @param {WebpackConfig} config
 * @param {String} request
 */
module.exports = function findMatchedLoaders(config, request) {
  var loaders = [];

  if (config.module) {
    loaders = [].concat(
      config.module.preLoaders || [],
      config.module.loaders || [],
      config.module.postLoaders || []
    );
  }

  return loaders.filter(function(loaderConfig) {
    return matcher(loaderConfig, request);
  });
};