var interpolate = require('loader-utils').interpolateName;

/**
 * Interpolates a filename template using multiple placeholders.
 * Advanced interpolateName from loader-utils package.
 * @see https://github.com/webpack/loader-utils#interpolatename
 * @param {String} filename Name with optional pattern placeholders
 * @param {Object} options
 * @param {String} options.path Absolute resource path
 * @param {String} options.context Absolute context path
 * @param {String} [options.content] Resource content
 * @param {Object} [options.replacements] Extra replacements, e.g {'[foo]': 'bar'}
 * @returns {String}
 */
module.exports = function interpolateName(filename, options) {
  var interpolated = interpolate({resourcePath: options.path}, filename, {
    context: options.context,
    content: options.content
  });

  if (options.replacements) {
    for (var key in options.replacements) {
      var value = options.replacements[key];
      var regex = new RegExp(escapeRegExpSpecialChars(key), 'g');
      interpolated = interpolated.replace(regex, value);
    }
  }

  return interpolated;
};

function escapeRegExpSpecialChars(regexStr) {
  return regexStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}