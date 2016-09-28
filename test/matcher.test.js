var matcher = require('../lib/matcher');
var extend = require('object-assign');

describe('matcher()', () => {
  it('should work', () => {
    matcher({test: /\.txt$/, include: 'path/'}, 'path/file.txt').should.be.true;
  });

  it('should accept regexp as criteria', () => {
    matcher(/\.m$/, 'path/file.m').should.be.true;
  });

  it('should not modify input data', () => {
    var expectedCriteria = {
      test: /\.txt$/,
      include: false,
      exclude: 'qwe'
    };
    var input = 'path/a/b';
    var criteria = extend({}, expectedCriteria);

    matcher(criteria, input);

    criteria.should.be.eql(expectedCriteria);
  });
});