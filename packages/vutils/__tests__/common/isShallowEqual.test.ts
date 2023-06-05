/* eslint-disable @typescript-eslint/no-empty-function */
import { isShallowEqual } from '../../src';

describe('isShallowEqual', () => {
  it('isShallowEqual({a:1, b: "b"}, {a: 1, b: "b"}) should be false', () => {
    expect(isShallowEqual({ a: 1, b: 'b' }, { a: 1, b: 'b' })).toBeTruthy();
  });

  it('isShallowEqual({a:1, b: [2, 3, 4]}, {a: 1, b: [2, 3, 4]}) should be false', () => {
    expect(isShallowEqual({ a: 1, b: [2, 3, 4] }, { a: 1, b: [2, 3, 4] })).toBeFalsy();
  });

  it('isShallowEqual({a:1, b: function}, {a: 1, b: function) should be false', () => {
    expect(isShallowEqual({ a: 1, b: () => {} }, { a: 1, b: () => {} })).toBeFalsy();
  });
});
