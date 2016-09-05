/**
 * Creates asset file in compilation with provided content.
 * @param {Compilation} compilation
 * @param {String} path Relative to compilation.compiler.context
 * @param {String} content
 */
module.exports = function emitAsset(compilation, path, content) {
  compilation.assets[path] = {
    size: function() {
      return content.length;
    },
    source: function() {
      return content;
    }
  };
};