module.exports = function getWebpackVersion(onlyMajor) {
  var version = require('webpack/package.json').version;

  return typeof onlyMajor === 'boolean' && onlyMajor
    ? version.split('.')[0]
    : version;
};