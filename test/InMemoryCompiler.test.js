var MemoryFS = require('memory-fs');
var Promise = require('bluebird');
var CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');
var NodeOutputFileSystem = require('webpack/lib/node/NodeOutputFileSystem');
var Compilation = require('webpack/lib/Compilation');
var WebpackCompiler = require('webpack/lib/Compiler');
var InMemoryCompiler = require('../lib/InMemoryCompiler');
var createCachedInputFileSystem = require('../lib/createCachedInputFileSystem');

describe('InMemoryCompiler', () => {
  it('should export static fields', () => {
    InMemoryCompiler.defaultConfig.should.exist.and.be.an('object');
    InMemoryCompiler.defaultWebpackConfig.should.exist.and.be.an('object');
  });

  describe('constructor()', () => {
    it('should create instance via function call', () => {
      InMemoryCompiler().should.be.instanceOf(InMemoryCompiler);
    });

    it('should assign properties', () => {
      InMemoryCompiler().should.have.property('_compiler').that.is.instanceOf(WebpackCompiler);
    });
    
    it('should use memory-fs as input & output filesystem by default', () => {
      var _compiler = InMemoryCompiler()._compiler;
      _compiler.inputFileSystem.should.be.instanceOf(MemoryFS);
      _compiler.resolvers.normal.fileSystem.should.be.instanceOf(MemoryFS);
      _compiler.resolvers.context.fileSystem.should.be.instanceOf(MemoryFS);
      _compiler.outputFileSystem.should.be.instanceOf(MemoryFS);
    });

    it('should allow to pass custom input filesystem', () => {
      var inputFS = createCachedInputFileSystem();
      var _compiler = InMemoryCompiler(null, {inputFS: inputFS})._compiler;
      _compiler.inputFileSystem.should.be.instanceOf(CachedInputFileSystem);
      _compiler.resolvers.normal.fileSystem.should.be.instanceOf(CachedInputFileSystem);
      _compiler.resolvers.context.fileSystem.should.be.instanceOf(CachedInputFileSystem);
    });

    it('should allow to pass custom input filesystem', () => {
      var outputFS = new NodeOutputFileSystem();
      var _compiler = InMemoryCompiler(null, {outputFS: outputFS})._compiler;
      _compiler.outputFileSystem.should.be.instanceOf(NodeOutputFileSystem);
    });

    it('should use `defaultWebpackConfig` as default Webpack config', () => {
      var _compiler = InMemoryCompiler()._compiler;
      Object.keys(InMemoryCompiler.defaultWebpackConfig).forEach(key => {
        var defaultCfgValue = InMemoryCompiler.defaultWebpackConfig[key];
        _compiler.options[key].should.be.equal(defaultCfgValue);
      });
    });
  });
  
  describe('run()', () => {
    it('should return a Promise', () => {
      return InMemoryCompiler().run()
        .should.be.fulfilled
        .and.have.a.property('then').that.is.a('function');
    });

    it('should reject if something wrong', () => {
      return InMemoryCompiler({entry: 'qwe'}).run().should.be.rejected;
    });

    it('should resolve with compilation object', () => {
      return InMemoryCompiler().run().should.eventually.be.instanceOf(Compilation);
    });
  });

  it('addEntry()', () => {
    var entryName = 'qwe';
    var fs = new MemoryFS({'entry.js': new Buffer('')});
    var compiler = new InMemoryCompiler({
      context: '/',
      output: {
        filename: '[name]'
      }
    }, {inputFS: fs});

    compiler.addEntry('./entry', entryName).should.be.instanceOf(InMemoryCompiler);
    return compiler.run().should.eventually.have.property('assets').with.property(entryName);
  });

  it('setInputFS()', () => {
    var compiler = InMemoryCompiler();
    var fs = new MemoryFS();
    var _compiler = compiler._compiler;

    compiler.setInputFS(fs).should.be.equal(compiler);
    _compiler.inputFileSystem.should.be.equal(fs);
    _compiler.resolvers.normal.fileSystem.should.be.equal(fs);
    _compiler.resolvers.context.fileSystem.should.be.equal(fs);
  });

  it('setOutputFS()', () => {
    var compiler = InMemoryCompiler();
    var fs = new MemoryFS();
    var _compiler = compiler._compiler;

    compiler.setOutputFS(fs).should.be.equal(compiler);
    _compiler.outputFileSystem.should.be.equal(fs);
  });
});