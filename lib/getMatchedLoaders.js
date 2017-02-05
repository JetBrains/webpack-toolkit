var matcher = require('webpack/lib/ModuleFilenameHelpers').matchObject;

function analyze(loadersConfig) {
  var apiVersion;
  var isChainable;
  var has = loadersConfig.hasOwnProperty.bind(loadersConfig);

  if (has('loaders') || has('preLoaders') || has('postLoaders')) {
    apiVersion = 1;
  } else if (has('rules')) {
    apiVersion = 2;
  } else {
    apiVersion = -1; // unknown
    // throw new Error('Cannot determine loaders config API version. `preLoaders`, `loaders`, `postLoaders` - v1; `rules` - v2');
  }

  return {
    apiVersion: apiVersion
  }
}

/**
 * @param {Object} loadersConfig Loaders options object (preLoaders, loaders, postLoaders)
 * @param {String} request
 * @see http://webpack.github.io/docs/configuration.html#module-loaders
 */
module.exports = function findMatchedLoaders(loadersConfig, request) {
  var loaders;
  var apiVersion = analyze(loadersConfig).apiVersion;

  switch (apiVersion) {
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
