var find = require('../lib/getMatchedLoaders');

describe('findMatchedLoaders()', () => {
  var defaultConfig = {test: /\.txt$/, loader: 'tralala'};
  var defaultRequest = 'qwe.txt';

  it('should return empty array if no matched loaders found', () => {
    var config = {
      loaders: [defaultConfig]
    };
    find(config, 'index.css').should.be.an('array').and.be.empty;
  });

  it('should work with preLoaders', () => {
    var config = {
      preLoaders: [defaultConfig]
    };
    find(config, defaultRequest).should.be.eql([defaultConfig]);
  });

  it('should work with loaders', () => {
    var config = {
      loaders: [defaultConfig]
    };
    find(config, defaultRequest).should.be.eql([defaultConfig]);
  });

  it('should work with postLoaders', () => {
    var config = {
      postLoaders: [defaultConfig]
    };
    find(config, defaultRequest).should.be.eql([defaultConfig]);
  });

  it('should work with pre-, post- and loaders combination', () => {
    var preLoaders = [{test: /index.css/, loader: 'pre-loader'}];
    var loaders = [{test: /\.css$/, loader: 'loader'}];
    var postLoaders = [{test: /css/, loader: 'post-loader'}];

    var config = {
      preLoaders: preLoaders,
      loaders: loaders,
      postLoaders: postLoaders
    };

    find(config, 'index.css').should.eql(
      [].concat(preLoaders, loaders, postLoaders)
    )
  });
});