import { isString } from '../../src';

describe('isString', () => {
  it('isString("abc") should be true', () => {
    expect(isString('abc')).toBeTruthy();
  });

  it('isString(1) should be false', () => {
    expect(isString(1)).toBeFalsy();
  });
});
