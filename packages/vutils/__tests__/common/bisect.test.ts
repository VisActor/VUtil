import { bisect } from '../../src';

const values = [1, 5, 7, 9, 10, 20];

describe('bisect', () => {
  it('bisect(values, 5) should be 2', () => {
    expect(bisect(values, 5)).toBe(2);
  });

  it('bisect(values, 1) should be 1', () => {
    expect(bisect(values, 1)).toBe(1);
  });

  it('bisect(values, -1) should be 1', () => {
    expect(bisect(values, 1)).toBe(1);
  });

  it('bisect(values, 100) should be 6', () => {
    expect(bisect(values, 100)).toBe(6);
  });

  it('bisect(values, 100, 3, 6) should be 6', () => {
    expect(bisect(values, 100, 3, 6)).toBe(6);
  });
});
