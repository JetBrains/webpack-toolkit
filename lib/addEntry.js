var SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

/**
 * Add single entry programmatically. Loaders syntax allowed in entryPath param.
 * @param {Compiler} compiler
 * @param {String} path Entry path. Relative to compiler context path.
 * @param {String} [name='main'] Entry name
 * @param {String} [context]
 */
module.exports = function addSingleEntry(compiler, path, name, context) {
  var entry = new SingleEntryPlugin(context || compiler.options.context, path, name || 'main');
  compiler.apply(entry);
};