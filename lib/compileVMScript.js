var vm = require('vm');
var merge = require('object-assign');

/**
 * @param {String} source
 * @param {Object} [context]
 * @param {Object} [scriptOptions] {@see https://nodejs.org/api/vm.html#vm_new_vm_script_code_options}
 * @returns {*} Compilation result
 */
module.exports = function compileVMScript(source, context, scriptOptions) {
  var script = new vm.Script(source, scriptOptions);
  var ctx = merge({require: require, module: module}, global, context || {});
  var result;

  try {
    result = script.runInContext(vm.createContext(ctx));
  } catch (e) {
    throw e;
  }

  return result;
};