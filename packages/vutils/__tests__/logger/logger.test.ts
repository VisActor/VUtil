import { Logger } from './../../src/logger';

describe('logger', () => {
  it('test logger', () => {
    const logger = new Logger();
    expect(logger.level()).toBe(0);
    logger.level(1);
    expect(logger.level()).toBe(1);
    expect(logger.canLogError()).toBe(true);
    expect(logger.canLogInfo()).toBe(false);
  });

  it('test Logger.instance', () => {
    const logger = Logger.getInstance(1, 'log');
    expect(logger.level()).toBe(1);
    Logger.setInstanceLevel(2);
    expect(logger.level()).toBe(2);
    Logger.clearInstance();
    expect(logger).not.toBe(Logger.getInstance());
    Logger.setInstance(logger);
    expect(logger).toBe(Logger.getInstance());
  });
});
