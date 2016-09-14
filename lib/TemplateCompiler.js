var ChildCompiler = require('./ChildCompiler');
var compile = require('./compileVMScript');

var SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
var NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
var LoaderTargetPlugin = require('webpack/lib/LoaderTargetPlugin');
var NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
var LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin');

var filename = '__template-compiler-filename';

/**
 * @param {Compilation} compilation
 * @param {String} templatePath
 * @constructor
 */
function TemplateCompiler(compilation, templatePath) {
  ChildCompiler.call(this, compilation, {
    name: 'TemplateCompiler: ' + templatePath,
    output: {
      filename: filename
    }
  });

  var compiler = this._compiler;

  compiler.apply(new SingleEntryPlugin(compiler.context, templatePath));
  compiler.apply(new NodeTargetPlugin());
  compiler.apply(new LoaderTargetPlugin('node'));
  compiler.apply(new NodeTemplatePlugin(compiler.options.output));
  compiler.apply(new LimitChunkCountPlugin({maxChunks: 1}));
}

module.exports = TemplateCompiler;

TemplateCompiler.prototype = Object.create(ChildCompiler.prototype);

/**
 * @returns {Promise} VM script compilation result
 */
TemplateCompiler.prototype.run = function() {
  return ChildCompiler.prototype
    .run.call(this)
    .then(function(compilation) {
      var source = compilation.assets[filename].source();

      delete compilation.assets[filename];
      delete compilation.compiler.parentCompilation.assets[filename];

      return compile(source);
    });
};