import { isObject } from '../../src';

describe('isObject', () => {
  it('isObject({}) should be true', () => {
    expect(isObject({})).toBeTruthy();
  });

  it('isObject([1, 2, 3]) should be true', () => {
    expect(isObject([1, 2, 3])).toBeTruthy();
  });

  it('isObject(Function) should be true', () => {
    expect(isObject(Function)).toBeTruthy();
  });

  it('isObject(null) should be false', () => {
    expect(isObject(null)).toBeFalsy();
  });
});
