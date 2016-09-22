/**
 * @param {Compilation} compilation
 * @param {String} filepath
 * @returns {Module}
 */
module.exports = function findModuleByFilepath(compilation, filepath) {
  var module = compilation.modules.filter(function (module) {
    return module._source && module.resource === filepath
  })[0];

  return module ? module : null;
};