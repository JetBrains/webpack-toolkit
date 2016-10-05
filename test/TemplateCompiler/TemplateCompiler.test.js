var path = require('path');
var sinon = require('sinon');
var MemoryFS = require('memory-fs');

var TemplateCompiler = require('../../lib/TemplateCompiler');
var ChildCompiler = require('../../lib/ChildCompiler');
var InMemoryCompiler = require('../../lib/InMemoryCompiler');
var createCompilation = require('../../lib/createCompilation');
var createInputFS = require('../../lib/createCachedInputFileSystem');
var compile = require('../../lib/compileVMScript');

describe('TemplateCompiler', () => {
  it('should export static fields', () => {
    TemplateCompiler.defaultConfig.should.exist.and.be.an('object');
  });

  describe('constructor()', () => {
    it('should create instance via function call', () => {
      TemplateCompiler(createCompilation(), {template: 'qwe'})
        .should.be.instanceOf(TemplateCompiler)
        .and.instanceOf(ChildCompiler);
    });

    it('should assign compiler name if not presented', () => {
      var outputOptions = {
        filename: 'qwe',
        publicPath: '/qwe'
      };
      var compiler = TemplateCompiler(createCompilation(), {
        template: 'qwe',
        output: outputOptions
      });

      var config = compiler.config;
      var _compiler = compiler._compiler;

      config.name.should.be.a('string').and.be.not.empty;
      config.output.should.be.eql(outputOptions);
      _compiler.name.should.be.equal(config.name);

      Object.keys(outputOptions).forEach(key => {
        var value = outputOptions[key];
        _compiler.options.output[key].should.be.equal(value);
      });
    });

    it('should call `addEntry` with proper params', () => {
      sinon.spy(TemplateCompiler.prototype, 'addEntry');

      var compiler = TemplateCompiler(createCompilation(), {
        template: 'qwe',
        output: {filename: 'template-output-file'}
      });

      compiler.addEntry.should.have.been.calledWith('qwe', 'template-output-file');

      TemplateCompiler.prototype.addEntry.restore();
    });
  });

  describe('run()', () => {
    var fixturesPath = path.resolve(__dirname, 'fixtures');

    it('should work', (done) => {
      InMemoryCompiler({context: fixturesPath})
        .setInputFS(createInputFS())
        .run()
        .then(c => {
          var compiler = TemplateCompiler(c, {template: './toUpperCase'});
          return compiler.run();
        })
        .then(func => {
          func('abc').should.be.equal('ABC');
          done();
        })
        .catch(done);
    });
  });
});