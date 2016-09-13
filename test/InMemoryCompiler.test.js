var MemoryFS = require('memory-fs');
var Promise = require('bluebird');
var NodeJSInputFileSystem = require('enhanced-resolve/lib/NodeJSInputFileSystem');
var CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');
var NodeOutputFileSystem = require('webpack/lib/node/NodeOutputFileSystem');
var Compilation = require('webpack/lib/Compilation');
var PromisifiedMemoryFS = require('../lib/PromisifiedMemoryFileSystem');

var Compiler = require('../lib/InMemoryCompiler');

var fsStorageDuration = 60000;

describe('InMemoryCompiler', () => {
  it('should export static fields', () => {
    Compiler.defaultConfig.should.exist;
    Compiler.defaultWebpackConfig.should.exist;
  });

  describe('constructor()', () => {
    it('should create instance via function call', () => {
      Compiler().should.be.instanceOf(Compiler);
    });
    
    it('should use memory-fs as input & output filesystem by default', () => {
      var _compiler = Compiler()._compiler;
      _compiler.inputFileSystem.should.be.instanceOf(MemoryFS);
      _compiler.resolvers.normal.fileSystem.should.be.instanceOf(MemoryFS);
      _compiler.resolvers.context.fileSystem.should.be.instanceOf(MemoryFS);
      _compiler.outputFileSystem.should.be.instanceOf(MemoryFS);
    });

    it('should allow to pass custom input filesystem', () => {
      var inputFS = new CachedInputFileSystem(new NodeJSInputFileSystem, fsStorageDuration);
      var _compiler = Compiler(null, {inputFS: inputFS})._compiler;
      _compiler.inputFileSystem.should.be.instanceOf(CachedInputFileSystem);
      _compiler.resolvers.normal.fileSystem.should.be.instanceOf(CachedInputFileSystem);
      _compiler.resolvers.context.fileSystem.should.be.instanceOf(CachedInputFileSystem);
    });

    it('should allow to pass custom input filesystem', () => {
      var outputFS = new NodeOutputFileSystem();
      var _compiler = Compiler(null, {outputFS: outputFS})._compiler;
      _compiler.outputFileSystem.should.be.instanceOf(NodeOutputFileSystem);
    });

    it('should use `defaultWebpackConfig` as default Webpack config', () => {
      var _compiler = Compiler()._compiler;
      Object.keys(Compiler.defaultWebpackConfig).forEach(key => {
        var defaultCfgValue = Compiler.defaultWebpackConfig[key];
        _compiler.options[key].should.be.equal(defaultCfgValue);
      });
    });
  });
  
  describe('run()', () => {
    it('should return a Promise', () => {
      var promise = Compiler().run();
      promise.then.should.exist.and.be.a('function');
      return promise;
    });

    it('should reject if something wrong', () => {
      return Compiler({entry: 'qwe'}).run().should.be.rejected;
    });

    it('should resolve with compilation object', () => {
      return Compiler().run().should.eventually.be.instanceOf(Compilation);
    });
  });

  describe('addEntry()', () => {
    it('should add entries', () => {
      var entryName = 'qwe';
      var fs = new MemoryFS({'entry.js': new Buffer('')});
      var compiler = new Compiler({
        context: '/',
        output: {
          filename: '[name]'
        }
      }, {inputFS: fs});

      compiler.addEntry('./entry', entryName);

      return compiler.run().should.eventually.have.property('assets').with.property(entryName);
    });
  });
});