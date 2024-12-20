import { isPlainObject } from '../../src';

describe('isPlainObject', () => {
  it('isPlainObject({}) should be true', () => {
    expect(isPlainObject({})).toBeTruthy();
  });

  it('isPlainObject([1, 2, 3]) should be false', () => {
    expect(isPlainObject([1, 2, 3])).toBeFalsy();
  });

  it('isPlainObject(Function) should be false', () => {
    expect(isPlainObject(Function)).toBeFalsy();
  });

  it('isPlainObject(null) should be false', () => {
    expect(isPlainObject(null)).toBeFalsy();
  });

  it('isPlainObject(undefined) should be false', () => {
    expect(isPlainObject(undefined)).toBeFalsy();
  });
});
