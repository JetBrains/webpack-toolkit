var webpack = require('webpack');
var MemoryFileSystem = require('memory-fs');
var Promise = require('bluebird');

/**
 * @constructor
 * @param {WebpackConfig} config
 * @param {boolean} [inputFS=true] Input filesystem
 * @param {boolean} [outputFS=true] Output filesystem
 */
function InMemoryCompiler(config, inputFS, outputFS) {
  var input = typeof inputFS == 'boolean' ? inputFS : true;
  var output = typeof outputFS == 'boolean' ? outputFS : true;

  if (!input && !output) {
    throw new Error('In-memory input or output (or both) filesystem should be true');
  }

  var compiler = webpack(config);
  var fs = new MemoryFileSystem();

  if (input) {
    /** @type {MemoryFileSystem} */
    compiler.inputFileSystem = fs;
    compiler.resolvers.normal.fileSystem = fs;
    compiler.resolvers.context.fileSystem = fs;
  }

  if (output) {
    /** @type {MemoryFileSystem} */
    compiler.outputFileSystem = fs;
  }

  this.inputFileSystem = compiler.inputFileSystem;
  this.outputFileSystem = compiler.outputFileSystem;
  this._compiler = compiler;
}

module.exports = InMemoryCompiler;

/**
 * @param {String} path
 * @param {String} content
 */
InMemoryCompiler.prototype.writeFileSync = function(path, content) {
  this.inputFileSystem.writeFileSync(path, content, 'utf-8');
};

/**
 * @returns {Promise<Compilation>}
 */
InMemoryCompiler.prototype.run = function() {
  var compiler = this._compiler;

  return new Promise(function (resolve, reject) {
    compiler.run(function (err, stats) {
      if (err) {
        return reject(err);
      }

      var compilation = stats && stats.compilation;
      var hasErrors = Boolean(compilation.errors && compilation.errors.length);

      if (hasErrors) {
        var errorDetails = compilation.errors.map(function (error) {
          return error.message + (error.error ? ':\n' + error.error : '');
        }).join('\n');

        reject(new Error('InMemoryCompiler compilation failed: %s', errorDetails));
      } else {
        resolve(compilation);
      }
    });
  });
};