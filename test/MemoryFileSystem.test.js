var MemoryFS = require('memory-fs');
var FS = require('../lib/MemoryFileSystem');
var Promise = require('bluebird');

var promisifiedMethods = [
  'exists',
  'stat',
  'readFile',
  'readdir',
  'mkdir',
  'mkdirp',
  'rmdir',
  'unlink',
  'readlink',
  'writeFile',
  'writep'
];

var allMethods = promisifiedMethods.concat([
  // sync methods
  'join',
  'normalize',
  'createReadStream',
  'createWriteStream'
]);

var statObjectMethods = [
  'isBlockDevice',
  'isCharacterDevice',
  'isDirectory',
  'isFIFO',
  'isFile',
  'isSocket',
  'isSymbolicLink'
];

describe('PromisifiedMemoryFileSystem', () => {
  describe('constructor', () => {
    it('should create instance via function call', () => {
      FS().should.be.instanceOf(FS);
    });

    it('should assign properties', () => {
      FS().should.have.property('fs').that.an.instanceOf(MemoryFS);
    });

    it('should create memory-fs instance if no arguments passed', () => {
      FS().fs.should.exist.and.be.instanceOf(MemoryFS);
    });

    it('should allow to pass memory-fs instance', () => {
      var fs = new MemoryFS();
      FS(fs).fs.should.be.equal(fs);
    });

    it('should pass `data` to memory-fs', () => {
      var data = {qwe: 123};
      FS(data).fs.data.should.exist.and.be.eql(data);
    });
  });

  describe('methods', () => {
    it('all methods should exists', () => {
      var fs = FS();
      allMethods.forEach(method => {
        fs.should.have.property(method);
        fs[method].should.be.a('function');
      });
    });

    it('promisified methods should reject if invalid path provided', () => {
      var fs = FS();
      return Promise.map(promisifiedMethods, methodName => {
        return fs[methodName]('qwe').should.be.rejected;
      });
    });

    it('exists()', () => {
      var fs = FS({qwe: new Buffer(123)});
      return Promise.all([
        fs.exists('/qwe').should.become(true),
        fs.exists('/qwe2').should.become(false)
      ]);
    });

    describe('stat()', () => {
      it('should resolve with proper stat object', () => {
        var fs = FS({qwe: new Buffer(123)});
        return fs.stat('/qwe').then(stats => {
          statObjectMethods.forEach(method => {
            stats.should.have.property(method);
            stats[method].should.be.a('function');
            stats[method]().should.be.a('boolean');
          });
        });
      });
    });

    describe('readFile()', () => {
      it('should return Buffer if encoding not specified and string otherwise', () => {
        var fs = FS({
          qwe: new Buffer(123),
          qwe2: new Buffer(123)
        });

        return Promise.all([
          fs.readFile('/qwe').should.eventually.be.instanceOf(Buffer),
          fs.readFile('/qwe2', 'utf-8').should.eventually.be.a('string')
        ]);
      });
    });

    describe('writep()', () => {
      it('should use empty content & utf-8 as default params', () => {
        var fs = FS();

        return fs.writep('/qwe')
          .then(() => { return fs.readFile('/qwe', 'utf-8') })
          .should.become('')
      });

      it('should create subdirectories in complex path', () => {
        var fs = FS();
        var promise = fs.writep('/1/2/3/qwe');

        return Promise.all([
          promise.then(() => fs.readdir('/')).should.become(['1']),
          promise.then(() => fs.readdir('/1')).should.become(['2']),
          promise.then(() => fs.readdir('/1/2')).should.become(['3']),
          promise.then(() => fs.readdir('/1/2/3')).should.become(['qwe'])
        ]);
      });
    });
  });
});