var vm = require('vm');
var Promise = require('bluebird');
var extend = require('object-assign');

/**
 * @param {String} source
 * @param {Object} [context]
 * @param {Object} [scriptOptions] {@see https://nodejs.org/api/vm.html#vm_new_vm_script_code_options}
 * @returns {Promise} Compilation result
 */
module.exports = function compileVMScript(source, context, scriptOptions) {
  var script = new vm.Script(source, scriptOptions);
  var ctx = extend({require: require, module: module}, global, context || {});
  var result;

  try {
    result = script.runInContext(vm.createContext(ctx));
  } catch (e) {
    return Promise.reject(e);
  }

  return Promise.resolve(result);
};