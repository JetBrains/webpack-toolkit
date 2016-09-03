/**
 * @param {String} loaderName Loader name or absolute path
 * @param {Object} [query]
 * @param {String} [resourcePath] Relative or absolute path to resource
 * @returns {String}
 * @example
 * stringifyLoaderRequest('file', {name: '[name].[ext]'}, './image.png');
 * // => 'file?name=[name].[ext]!./image.png'
 */
module.exports = function stringifyLoaderRequest(loaderName, query, resourcePath) {
  return [
    loaderName,
    (query)
      ? '?' + JSON.stringify(query)
      : '',
    (resourcePath)
      ? '!' + resourcePath
      : ''
  ].join('');
};