var SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

/**
 * Add single entry programmatically. Loaders syntax allowed in entryPath param.
 * @param {Compiler} compiler
 * @param {String} entryPath Entry path. Relative to compiler context path.
 * @param {String} entryName Entry name
 * @param {String} [contextPath]
 */
module.exports = function addSingleEntry(compiler, entryPath, entryName, contextPath) {
  var entry = new SingleEntryPlugin(contextPath || null, entryPath, entryName);
  compiler.apply(entry);
};