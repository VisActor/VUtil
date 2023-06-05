import { ascending } from '../../src';

describe('ascending', () => {
  it('ascending(1, 2) should be -1', () => {
    expect(ascending(1, 2)).toBe(-1);
  });

  it('ascending(2, 1) should be 1', () => {
    expect(ascending(2, 1)).toBe(1);
  });

  it('ascending(2, 2) should be 0', () => {
    expect(ascending(2, 2)).toBe(0);
  });

  it('ascending(1, NaN) should be true', () => {
    expect(ascending(1, NaN)).toBeNaN();
  });
});
