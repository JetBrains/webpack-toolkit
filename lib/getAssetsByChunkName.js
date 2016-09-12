/**
 * Advanced assetsByChunkName:
 * 1. Normalize chunks-to-assets map. Originally in Webpack stats object it will be a
 *    string when 1 asset or array otherwise. This function always returns an array.
 * 2. Calculate additional assets which is not represented in original Webpack stats object.
 *    For example images resolved & compiled with html-loader won't be presented
 *    in original stats object.
 *
 * @param {Compilation} compilation
 * @return {Object<String, Array>} assetsByChunkName
 */
function getAssetsByChunkName(compilation) {
  var assetsByChunkName = compilation.getStats().toJson().assetsByChunkName;
  var additionalAssets = getAdditionalAssets(compilation);

  Object.keys(assetsByChunkName).forEach(function(chunkName) {
    var chunkAssets = typeof assetsByChunkName[chunkName] == 'string' ? [assetsByChunkName[chunkName]] : assetsByChunkName[chunkName];

    if (chunkName in additionalAssets) {
      additionalAssets[chunkName].forEach(function(assetPath) {
        chunkAssets.indexOf(assetPath) == -1 && chunkAssets.push(assetPath);
      });
    } else {
      assetsByChunkName[chunkName] = chunkAssets;
    }
  });

  return assetsByChunkName;
}

module.exports = getAssetsByChunkName;

/**
 * @param {Compilation} compilation
 * @returns {Object<String, Array>} assetsByChunkName
 */
function getAdditionalAssets(compilation) {
  var stats = compilation.getStats().toJson();
  var modules = stats.modules;
  var chunks = {};

  modules.forEach(function (module) {
    var moduleChunks = module.chunks;
    var isNormalModule = module.chunks.length > 0 && module.assets.length == 0;
    if (isNormalModule)
      return;

    if (module.assets.length > 0 && module.chunks.length > 0) {
      var cName = stats.chunks.filter(function (chunk) { return chunk.id == moduleChunks[0] })[0].names[0];
      if (!(cName in chunks)) chunks[cName] = [];

      chunks[cName] = chunks[cName].concat(module.assets);
    }

    var parentModule, parentChunk;
    module.reasons
      .filter(function (reason) { return reason.type == 'loader' })
      .forEach(function (reason) {
        parentModule = modules.filter(function (m) { return reason.moduleIdentifier == m.identifier })[0];
        parentChunk = stats.chunks.filter(function (chunk) { return parentModule.chunks[0] == chunk.id })[0];
      });

    if (parentChunk) {
      var parentChunkName = parentChunk.names[0];
      if (!(parentChunkName in chunks))
        chunks[parentChunkName] = [];

      chunks[parentChunkName] = chunks[parentChunkName].concat(module.assets);
    }

  });

  return chunks;
}

module.exports.getAdditionalAssets = getAdditionalAssets;