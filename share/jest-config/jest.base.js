const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  silent: true,
  testMatch: ['**/__tests__/**/*.test.[jt]s'],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        resolveJsonModule: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        module: 'ESNext',
        tsconfig: '<rootDir>/tsconfig.test.json'
      }
    ]
  },
  globals: {
    __DEV__: true
  },
  verbose: false,
  collectCoverageFrom: ['**/*.{ts}', '!**/node_modules/**'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['json-summary', 'lcov', 'text'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', 'interface.ts', '.d.ts', 'typings'],
  collectCoverageFrom: [
    '**/src/**',
    '!**/cjs/**',
    '!**/dist/**',
    '!**/es/**',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/types/**',
    '!**/interface.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    'd3-array': path.resolve(process.cwd(), './node_modules/d3-array/dist/d3-array.min.js')
  }
};
