var Compilation =  require('webpack/lib/Compilation');
var createCompilation = require('../lib/createCompilation');
var Compiler = require('../lib/ChildCompiler');
var InMemoryCompiler = require('../lib/InMemoryCompiler');
var MemoryFS = require('memory-fs');
var Promise = require('bluebird');

describe('ChildCompiler', () => {
  it('should export static fields', () => {
    Compiler.defaultName.should.exist.and.be.a('string');
  });

  describe('constructor()', () => {
    it('should create instance via function call', () => {
      var compilation = createCompilation();
      Compiler(compilation).should.be.instanceOf(Compiler);
    });

    it('should use default options', () => {
      var compilation = createCompilation();
      var _compiler = Compiler(compilation)._compiler;
      _compiler.name.should.equal(Compiler.defaultName);
      _compiler.options.output.should.eql(compilation.outputOptions);
    });

    it('should use passed options', () => {
      var options = {
        name: 'qwe',
        output: {
          filename: 'qwe.js'
        }
      };

      var compilation = createCompilation();
      var _compiler = Compiler(compilation, options)._compiler;

      _compiler.name.should.equal(options.name);

      Object.keys(options.output).forEach(key => {
        var val = options.output[key];
        _compiler.options.output[key].should.eql(val);
      });
    });
  });

  describe('run()', () => {
    it('should return a Promise', () => {
      return Compiler(createCompilation()).run()
        .should.be.fulfilled
        .and.have.a.property('then').that.is.a('function');
    });

    it('should reject with error if fatal error occurs', () => {
      // How make a fatal error?
      // TODO
    });

    it('should anyway resolve with compilation object even if compilation errors occurs', () => {
      var compiler = new Compiler(createCompilation());
      var compilerWithError = new Compiler(createCompilation());
      compilerWithError.addEntry('qwe');

      return Promise.all([
        compiler.run()
          .should.be.fulfilled
          .and.eventually.be.instanceOf(Compilation)
          .and.have.a.property('errors').that.lengthOf(0),

        compilerWithError.run()
          .should.be.fulfilled
          .and.eventually.be.instanceOf(Compilation)
          .and.have.a.property('errors').that.lengthOf(1)
      ]);
    });
  });

  describe('addEntry()', () => {
    it('should add entries and emit it in parent compilation', (done) => {
      var fs = new MemoryFS({'entry.js': new Buffer('')});

      var compiler = new InMemoryCompiler({
        context: '/',
        entry: './entry'
      }).setInputFS(fs);

      var entryName = 'qwe123';
      var parentCompilation;

      compiler.run()
        .then(compilation => {
          parentCompilation = compilation;

          var childCompiler = new Compiler(compilation, {
            output: {
              filename: '[name]'
            }
          });

          childCompiler.addEntry('./entry', entryName);
          return childCompiler.run();
        })
        .then((childCompilation) => {
          var parentAssets = parentCompilation.assets;
          var childAssets = childCompilation.assets;

          childAssets.should.have.property(entryName);
          parentAssets.should.have.property(entryName);

          parentAssets[entryName].should.equal(childAssets[entryName]);
          done();
        })
        .catch(done);
    });
  });
});