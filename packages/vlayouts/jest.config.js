const path = require('path');
const baseJestConfig = require('@internal/jest-config/jest.base');

module.exports = {
  ...baseJestConfig,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ...baseJestConfig.moduleNameMapper,
    '@visactor/vutils': path.resolve(__dirname, '../vutils/src/index.ts'),
    '@visactor/vscale': path.resolve(__dirname, '../vscale/src/index.ts')
  }
};
