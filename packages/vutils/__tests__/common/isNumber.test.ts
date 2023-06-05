import { isNumber } from '../../src';

describe('isNumber', () => {
  it('isNumber(3) should be true', () => {
    expect(isNumber(3)).toBeTruthy();
  });

  it('isNumber(Number.MIN_VALUE) should be true', () => {
    expect(isNumber(Number.MIN_VALUE)).toBeTruthy();
  });

  it('isNumber(Infinity) should be true', () => {
    expect(isNumber(Infinity)).toBeTruthy();
  });

  it('isNumber("3") should be false', () => {
    expect(isNumber('3')).toBeFalsy();
  });
});
