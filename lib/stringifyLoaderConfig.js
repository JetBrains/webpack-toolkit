function stringifyQuery(query) {
  var type = typeof query;

  if (type === 'undefined') {
    return '';
  }

  var stringified = (type === 'string') ? query : JSON.stringify(query);

  return '?' + stringified;
}

/**
 * @param {Object} config Loader options from Webpack config
 * @returns {String}
 * @throws {Error}
 */
module.exports = function stringifyLoaderConfig(config) {
  var stringified = '';
  var has = config.hasOwnProperty.bind(config);

  // It's strange but webpack 2 still allow to pass array of configs as `loader` value
  // see https://webpack.js.org/configuration/module/#useentry
  // TODO: drop last condition when `loaders` support will be removed (https://webpack.js.org/configuration/module/#rule-loaders)
  var loaders = config.use || config.loader || config.loaders;
  var options = config.options || config.query;
  var isArray = Array.isArray(loaders);

  if (isArray) {
    stringified = loaders.map(function (cfg) {
      return typeof cfg === 'string' ? cfg : stringifyLoaderConfig(cfg)
    }).join('!');
  } else {
    stringified = config.loader + stringifyQuery(options);
  }

  return stringified;
};
