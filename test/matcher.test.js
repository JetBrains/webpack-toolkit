var matcher = require('../lib/matcher');
var extend = require('object-assign');

describe('matcher()', () => {
  it('should work', () => {
    matcher({test: /\.txt$/, include: 'path/'}, 'path/file.txt').should.be.true;
  });

  it('should accept regexp as criteria', () => {
    matcher(/\.m$/, 'path/file.m').should.be.true;
  });
  
  it('should skip include or exclude parts if they is falsy', () => {
    matcher({include: 'anotherpath'}, 'path/file').should.be.false;
    matcher({include: false}, 'path/file').should.be.true;
    matcher({exclude: 'anotherpath'}, 'path/file').should.be.true;
    matcher({exclude: false}, 'path/file').should.be.true;
  });

  it('should work as filtering function if subject is array', () => {
    matcher(/\.txt$/, ['file.js', 'file.css', 'file.txt']).should.be.eql(['file.txt']);
  });

  it('should not modify input data', () => {
    var expectedCriteria = {
      test: /\.txt$/,
      include: false,
      exclude: 'qwe'
    };
    var expectedInput = ['path', 'path/a/b'];

    var criteria = extend({}, expectedCriteria);
    var input = [].concat(expectedInput);

    matcher(criteria, expectedInput);

    criteria.should.be.eql(expectedCriteria);
    input.should.be.eql(expectedInput);
  });
});