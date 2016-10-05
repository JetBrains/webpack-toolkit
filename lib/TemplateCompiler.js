var merge = require('object-assign');
var ChildCompiler = require('./ChildCompiler');
var SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
var NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
var LoaderTargetPlugin = require('webpack/lib/LoaderTargetPlugin');
var NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
var LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin');

var compileScript = require('./compileVMScript');

var defaultConfig = {
  template: null,
  compileInTemplateFunction: true,
  output: {
    filename: '__template-compiler-file'
  }
};

/**
 * @param {Compilation} compilation
 * @param {ChildCompilerConfig} config
 * @extends ChildCompiler
 * @constructor
 */
function TemplateCompiler(compilation, config) {
  if (this instanceof TemplateCompiler == false) {
    return new TemplateCompiler(compilation, config);
  }

  var cfg = merge({}, defaultConfig, config || {});

  if (typeof cfg.template != 'string') {
    throw new Error('`template` should be defined');
  }

  if (!cfg.name) {
    cfg.name = 'TemplateCompiler for ' + cfg.template;
  }

  ChildCompiler.call(this, compilation, cfg);

  this.config = cfg;
  this.addEntry(cfg.template, cfg.output.filename);
}

module.exports = TemplateCompiler;

TemplateCompiler.prototype = Object.create(ChildCompiler.prototype);

TemplateCompiler.defaultConfig = defaultConfig;

/**
 * @param {String} path Path to the resource
 * @param {String} [entryName='__template-compiler-file']
 * @param {String} [context] Build context
 * @returns {TemplateCompiler}
 */
TemplateCompiler.prototype.addEntry = function(path, entryName, context) {
  var compiler = this._compiler;

  compiler.apply(new SingleEntryPlugin(context || compiler.context, path, entryName));
  compiler.apply(new NodeTargetPlugin());
  compiler.apply(new LoaderTargetPlugin('node'));
  compiler.apply(new NodeTemplatePlugin(compiler.options.output));
  compiler.apply(new LimitChunkCountPlugin({maxChunks: 1}));

  return this;
};

/**
 * @returns {Promise<Function|String>}
 */
TemplateCompiler.prototype.run = function() {
  var config = this.config;
  var filename = config.output.filename;

  return ChildCompiler.prototype.run.call(this)
    .then(function(compilation) {
      var source = compilation.assets[filename].source();

      delete compilation.assets[filename];
      delete compilation.compiler.parentCompilation.assets[filename];

      return config.compileInTemplateFunction === true
        ? compileScript(source)
        : source;
    });
};