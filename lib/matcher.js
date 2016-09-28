var _matcher = require('webpack/lib/ModuleFilenameHelpers').matchObject;

/**
 * @typedef {Object} matchCriteria
 * @property {RegExp|String|Function|Array<RegExp|String|Function>} test
 * @property {RegExp|String|Function|Array<RegExp|String|Function>} include
 * @property {RegExp|String|Function|Array<RegExp|String|Function>} exclude
 */

/**
 * Skips `include` and `exclude` if they falsy.
 *
 * @param {RegExp|matchCriteria} criteria
 * @param {String} subject Works as filtering function if subject is array.
 * @returns {Boolean|Array<String>}
 */
module.exports = function matcher(criteria, subject) {
  var cr;

  if (criteria instanceof RegExp) {
    cr = {test: criteria};
  } else {
    cr = criteria;
  }

  return _matcher(cr, subject);
};