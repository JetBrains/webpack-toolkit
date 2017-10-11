/**
 * @see http://webpack.github.io/docs/loaders.html#loader-context
 * @see https://github.com/webpack/core/blob/master/lib/NormalModuleMixin.js#L67
 * @typedef {Object} LoaderContext
 * @property {Number} version=1 Loader API version.
 * @property {Array<{request: String, path: String, query: String, module: Function}>} loaders An array of all the loaders. It is writeable in the pitch phase.
 * @property {Number} loaderIndex=0
 * @property {String} context The directory of the module. Can be used as context for resolving other stuff.
 * @property {String} request The resolved request string.
 * @property {String} query The query of the request for the current loader.
 * @property {String} resource
 * @property {String} resourcePath
 * @property {String} resourceQuery
 * @property {String} inputValue=undefined
 * @property {String} value=null
 * @property {String} target='web'
 * @property {Object} options Compiler options
 * @property {*} data=undefined A data object shared between the pitch and the normal phase.
 * @property {Boolean} debug=false
 * @property {Boolean} webpack=true
 * @property {Object} fs
 * @property {Function} cacheable Make this loader result cacheable. By default it’s not cacheable.
 * @property {Function} emitWarning TODO
 * @property {Function} emitError TODO
 * @property {Function} exec TODO
 * @property {Function} resolve TODO
 * @property {Function} resolveSync TODO
 * @property {Function} loadModule TODO
 * @property {Function} dependency TODO
 * @property {Function} addDependency TODO
 * @property {Function} addContextDependency TODO
 * @property {Function} clearDependencies TODO
 * @property {Function} emitFile TODO
 * @property {Compilation} _compilation TODO
 * @property {Compiler} _compiler TODO
 * @property {Object} _module TODO
 */

/**
 * @param {LoaderContext} [context]
 * @constructor
 */
function MockedLoaderContext(context) {
  if (this instanceof MockedLoaderContext == false) {
    return new MockedLoaderContext(context);
  }

  this.isCacheable = undefined;
  this.isSync = true;

  var opts = context || {};
  this.version = opts.version || 1;
  this.context = opts.context || process.cwd();

  this.request = opts.request || '';
  this.query = opts.query || '';
  this.resource = opts.resource || '';
  this.resourcePath = opts.resourcePath || '';
  this.resourceQuery = opts.resourceQuery || '';

  this.data = opts.data || undefined;
}

module.exports = MockedLoaderContext;

/**
 * @param {Boolean} flag
 * @returns {Boolean}
 */
MockedLoaderContext.prototype.cacheable = function (flag) {
  this.isCacheable = flag !== false;
  return this.isCacheable;
};

/**
 * @returns {Function} mockedAsync
 */
MockedLoaderContext.prototype.async = function () {
  var resolve;
  var reject;

  this.isSync = false;

  this.asyncPromise = new Promise(function(res, rej) {
    resolve = res;
    reject = rej;
  });

  var mockedAsync = (function () {
    return function (err, result) {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    };
  });

  return mockedAsync();
};

/**
 * @param {Function} loader
 * @param {String} input
 * @returns {String|Promise}
 */
MockedLoaderContext.prototype.run = function (loader, input) {
  var result = loader.call(this, input);
  return this.isSync ? result : this.asyncPromise;
};