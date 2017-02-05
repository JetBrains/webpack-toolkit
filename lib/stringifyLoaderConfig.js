function analyze(config) {
  var apiVersion;
  var isChainable;
  var has = config.hasOwnProperty.bind(config);

  // It's strange but webpack 2 still allow to pass array of configs as `loader` value
  // see https://webpack.js.org/configuration/module/#useentry
  // TODO: drop last condition when `query` support will be removed (https://webpack.js.org/configuration/module/#rule-options-rule-query)
  if (has('loaders') || has('query') || (has('loader') && typeof config.loader === 'string') && !has('options')) {
    apiVersion = 1;

    if (has('loader')) {
      isChainable = false;
    } else if (has('loaders') && Array.isArray(config.loaders)) {
      isChainable = true;
    } else {
      throw new Error('Loader config should contain at least `loader` or `loaders` properties (in order of precedence)');
    }

  }
  // TODO: drop last condition when `loaders` support will be removed (https://webpack.js.org/configuration/module/#rule-loaders)
  else if (has('use') || has('options') || has('loader') || has('loaders')) {
    apiVersion = 2;

    if (has('loader')) {
      isChainable = Array.isArray(config.loader);
    }
    // TODO: drop last condition when `loaders` support will be removed (https://webpack.js.org/configuration/module/#rule-loaders)
    else if (has('use') || has('loaders')) {
      isChainable = true;
    } else {
      throw new Error('Loader config should contain at least `loader` or `use` properties (in order of precedence)');
    }

  } else {
    throw new Error('Cannot determine loader config API version. `loaders` or `query` - v1; `use` or `options` - v2');
  }

  return {
    apiVersion: apiVersion,
    isChainable: isChainable
  }
}

function stringifyQuery(query) {
  var type = typeof query;

  if (type === 'undefined') {
    return '';
  }

  var stringified = (type === 'string') ? query : JSON.stringify(query);

  return '?' + stringified;
}

/**
 * @param {Object} loaderConfig Loader options from Webpack config
 * @returns {String}
 * @throws {Error}
 */
module.exports = function stringifyLoaderConfig(loaderConfig) {
  var stringified = '';
  var info = analyze(loaderConfig);

  switch (info.apiVersion) {
    case 1:
      if (info.isChainable) {
        stringified = loaderConfig.loaders.join('!');
      } else {
        stringified = loaderConfig.loader + stringifyQuery(loaderConfig.query);
      }
      break;

    case 2:
      if (info.isChainable) {
        // It's strange but webpack 2 still allow to pass array of configs as `loader` value
        // see https://webpack.js.org/configuration/module/#useentry
        // TODO: drop last condition when `loaders` support will be removed (https://webpack.js.org/configuration/module/#rule-loaders)
        var loaders = loaderConfig.use || loaderConfig.loader || loaderConfig.loaders;

        stringified = loaders.map(function (cfg) {
          return typeof cfg === 'string' ? cfg : stringifyLoaderConfig(cfg)
        }).join('!');
      } else {
        stringified = loaderConfig.loader + stringifyQuery(loaderConfig.options);
      }

      break;
  }

  return stringified;
};
