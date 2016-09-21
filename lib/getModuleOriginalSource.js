/**
 * @param {Compilation} compilation
 * @param {String} filepath
 * @returns {Buffer|String|null}
 */
module.exports = function getModuleOriginalSource(compilation, filepath) {
  return compilation.modules
    .filter(function (module) { return module.resource && module._source })
    .map(function (module) { return module.resource === filepath ? module._source.source() : null })[0];
};