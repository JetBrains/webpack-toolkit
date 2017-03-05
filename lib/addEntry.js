var SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
var MultiEntryPlugin = require('webpack/lib//MultiEntryPlugin');

/**
 * Add single entry programmatically. Loaders syntax allowed in entryPath param.
 * @param {Compiler} compiler
 * @param {String} entry Entry location. Relative to compiler context path. Can contains loaders requests
 * @param {String} [name='main'] Entry name
 * @param {String} [context]
 */
module.exports = function addEntry(compiler, entry, name, context) {
  var ctx = context || compiler.options.context;
  var n = name || 'main';

  var dep = Array.isArray(entry)
    ? new MultiEntryPlugin(ctx, entry, n)
    : new SingleEntryPlugin(ctx, entry, n);

  compiler.apply(dep);
};
