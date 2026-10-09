const path = require('path');
const baseJestConfig = require('@internal/jest-config/jest.base');

module.exports = {
  ...baseJestConfig,
  // 性能用例测量真实 Node 构建产物；同包的其他 Jest worker 不能同时争用 CPU。
  maxWorkers: 1,
  moduleNameMapper: {
    ...baseJestConfig.moduleNameMapper
  }
};
