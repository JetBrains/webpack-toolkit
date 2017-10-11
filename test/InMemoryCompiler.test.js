var MemoryFS = require('memory-fs');
var CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');
var NodeOutputFileSystem = require('webpack/lib/node/NodeOutputFileSystem');
var Compilation = require('webpack/lib/Compilation');
var WebpackCompiler = require('webpack/lib/Compiler');
var InMemoryCompiler = require('../lib/InMemoryCompiler');
var createCachedInputFileSystem = require('../lib/createCachedInputFileSystem');

var entry = './entry';
var context = '/'; // context for memory fs is root

function createFSWithEntry(name, content) {
  var data = {'entry.js': new Buffer('')};

  if (name) {
    data[name] = new Buffer(content || '');
  }

  return new MemoryFS(data);
}

describe('InMemoryCompiler', () => {
  it('should export static fields', () => {
    InMemoryCompiler.defaultConfig.should.exist.and.be.an('object');
    InMemoryCompiler.defaultWebpackConfig.should.exist.and.be.an('object');
  });

  describe('constructor()', () => {
    it('should create instance via function call', () => {
      InMemoryCompiler({entry}).should.be.instanceOf(InMemoryCompiler);
    });

    it('should assign properties', () => {
      InMemoryCompiler({entry}).should.have.property('_compiler').that.is.instanceOf(WebpackCompiler);
    });
    
    it('should use memory-fs as input & output filesystem by default', () => {
      var compiler = InMemoryCompiler({entry});
      var _compiler = compiler._compiler;

      _compiler.inputFileSystem.should.be.instanceOf(MemoryFS);
      _compiler.resolvers.normal.fileSystem.should.be.instanceOf(MemoryFS);
      _compiler.resolvers.context.fileSystem.should.be.instanceOf(MemoryFS);
      _compiler.outputFileSystem.should.be.instanceOf(MemoryFS);
    });

    it('should allow to pass custom input filesystem', () => {
      var inputFS = createCachedInputFileSystem();
      var compiler = InMemoryCompiler({entry}).setInputFS(inputFS);

      var _compiler = compiler._compiler;
      _compiler.inputFileSystem.should.be.eql(inputFS);
      _compiler.resolvers.normal.fileSystem.should.be.eql(inputFS);
      _compiler.resolvers.context.fileSystem.should.be.eql(inputFS);
    });

    it('should allow to pass custom output filesystem', () => {
      var outputFS = new NodeOutputFileSystem();

      var compiler = InMemoryCompiler({entry}).setOutputFS(outputFS);

      var _compiler = compiler._compiler;
      _compiler.outputFileSystem.should.be.eql(outputFS);
    });
  });
  
  describe('run()', () => {
    it('should return a Promise', () => {
      return InMemoryCompiler({entry, context})
        .setInputFS(createFSWithEntry())
        .run()
        .should.be.fulfilled;
    });

    it('should reject if something wrong', () => {
      return InMemoryCompiler({entry: 'qwe', context}).run().should.be.rejected;
    });

    it('should resolve with compilation object', () => {
      return InMemoryCompiler({entry, context})
        .setInputFS(createFSWithEntry())
        .run()
        .should.eventually.be.instanceOf(Compilation);
    });
  });

  it('addEntry()', () => {
    var entryName = 'qwe';
    var compiler = new InMemoryCompiler({
      context: '/',
      entry,
      output: {
        filename: '[name]'
      }
    });

    compiler.setInputFS(createFSWithEntry('entry2'));
    compiler.addEntry('./entry2', entryName).should.be.instanceOf(InMemoryCompiler);

    return compiler.run().should.eventually.have.property('assets').with.property(entryName);
  });

  it('setInputFS()', () => {
    var compiler = InMemoryCompiler({entry});
    var fs = new MemoryFS();
    var _compiler = compiler._compiler;

    compiler.setInputFS(fs).should.be.equal(compiler);
    _compiler.inputFileSystem.should.be.equal(fs);
    _compiler.resolvers.normal.fileSystem.should.be.equal(fs);
    _compiler.resolvers.context.fileSystem.should.be.equal(fs);
  });

  it('setOutputFS()', () => {
    var compiler = InMemoryCompiler({entry});
    var fs = new MemoryFS();
    var _compiler = compiler._compiler;

    compiler.setOutputFS(fs).should.be.equal(compiler);
    _compiler.outputFileSystem.should.be.equal(fs);
  });
});