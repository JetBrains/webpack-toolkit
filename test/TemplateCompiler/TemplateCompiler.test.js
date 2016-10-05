var path = require('path');
var sinon = require('sinon');

var TemplateCompiler = require('../../lib/TemplateCompiler');
var ChildCompiler = require('../../lib/ChildCompiler');
var InMemoryCompiler = require('../../lib/InMemoryCompiler');
var createCompilation = require('../../lib/createCompilation');

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

    describe('Compatible with following template loaders', () => {

      it('js', (done) => {
        var compilation = createCompilation({context: fixturesPath});
        TemplateCompiler(compilation, {template: './toUpperCase'})
          .run()
          .then(func => {
            func('abc').should.be.equal('ABC');
            done();
          })
          .catch(done);
      });

      it('twig', (done) => {
        var compilation = createCompilation({
          context: fixturesPath,
          module: {
            loaders: [{
              test: /\.twig$/,
              loader: 'twig'
            }]
          }
        });

        var expected = [
            '  header',
            '  header2\n',
            'content2',
            'footer2'
          ].join('\n');

        TemplateCompiler(compilation, {template: './twig/custom-layout.twig'})
          .run()
          .then(func => {
            debugger;
            func().should.equal(expected);
            done();
          })
          .catch(done);
      });

    });
  });
});