var extend = require('object-assign');
var _matcher = require('webpack/lib/ModuleFilenameHelpers').matchObject;

/**
 * @typedef {Object} matchCriteria
 * @property {RegExp|String|Function|Array<RegExp|String|Function>} test
 * @property {RegExp|String|Function|Array<RegExp|String|Function>} include
 * @property {RegExp|String|Function|Array<RegExp|String|Function>} exclude
 */

/**
 * @param {RegExp|matchCriteria} criteria
 * @param {String|Array<String>} subject Works as filtering function if subject is array.
 * @returns {Boolean|Array<String>}
 */
module.exports = function matcher(criteria, subject) {
  if (criteria instanceof RegExp) {
    criteria = {test: criteria};
  } else {
    criteria = extend({}, criteria);
  }

  criteria.include === false && delete criteria.include;
  criteria.exclude === false && delete criteria.exclude;

  return Array.isArray(subject)
    ? subject.filter(_matcher.bind(null, criteria))
    : _matcher(criteria, subject);
};