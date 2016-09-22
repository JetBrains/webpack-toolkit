var NodeJSInputFileSystem = require('enhanced-resolve/lib/NodeJSInputFileSystem');
var CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');

module.exports = function createCachedInputFileSystem() {
  return new CachedInputFileSystem(new NodeJSInputFileSystem, 60000);
};