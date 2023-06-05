const path = require('path');
const baseJestConfig = require('@internal/jest-config/jest.base');

module.exports = {
  ...baseJestConfig,
  moduleNameMapper: {
    ...baseJestConfig.moduleNameMapper,
    'd3-geo': path.resolve(__dirname, './node_modules/d3-geo/dist/d3-geo.min.js'),
    'd3-dsv': path.resolve(__dirname, './node_modules/d3-dsv/dist/d3-dsv.min.js'),
    'd3-hexbin': path.resolve(__dirname, './node_modules/d3-hexbin/build/d3-hexbin.min.js'),
    'd3-hierarchy': path.resolve(__dirname, './node_modules/d3-hierarchy/dist/d3-hierarchy.min.js')
  }
};
