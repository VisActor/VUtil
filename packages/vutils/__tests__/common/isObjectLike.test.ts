import { isObjectLike } from '../../src';

describe('isObjectLike', () => {
  it('isObjectLike({}) should be true', () => {
    expect(isObjectLike({})).toBeTruthy();
  });

  it('isObjectLike([1, 2, 3]) should be true', () => {
    expect(isObjectLike([1, 2, 3])).toBeTruthy();
  });

  it('isObjectLike(Function) should be false', () => {
    expect(isObjectLike(Function)).toBeFalsy();
  });

  it('isObjectLike(null) should be false', () => {
    expect(isObjectLike(null)).toBeFalsy();
  });
});
