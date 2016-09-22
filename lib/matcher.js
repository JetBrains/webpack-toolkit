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
  var cr = criteria instanceof RegExp
    ? extend({test: criteria})
    : extend({}, criteria);

  cr.include === false && delete cr.include;
  cr.exclude === false && delete cr.exclude;

  return Array.isArray(subject)
    ? subject.filter(_matcher.bind(null, cr))
    : _matcher(cr, subject);
};