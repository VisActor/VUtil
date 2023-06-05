import { isFunction } from '../../src';

describe('isFunction', () => {
  it('isFunction(console.log) should be true', () => {
    // eslint-disable-next-line no-console
    expect(isFunction(console.log)).toBeTruthy();
  });

  it('isFunction(/abc/) should be false', () => {
    expect(isFunction(/abc/)).toBeFalsy();
  });

  it('isFunction(setTimeout) should be true', () => {
    expect(isFunction(setTimeout)).toBeTruthy();
  });

  it('isFunction(123) should be false', () => {
    expect(isFunction(123)).toBeFalsy();
  });

  it('isFunction(() => 123) should be true', () => {
    expect(isFunction(() => 123)).toBeTruthy();
  });

  it('isFunction(Math.round) should be true', () => {
    expect(isFunction(Math.round)).toBeTruthy();
  });

  it('isFunction(async () => {}) should be true', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(isFunction(async () => {})).toBeTruthy();
  });

  it('isFunction(class Any{}) should be true', () => {
    expect(isFunction(class Any {})).toBeTruthy();
  });
});
