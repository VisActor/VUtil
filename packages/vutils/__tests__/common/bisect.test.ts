import { bisect, findZeroOfFunction, binaryFuzzySearch } from '../../src';

const values = [1, 5, 7, 9, 10, 20];

describe('bisect', () => {
  it('bisect(values, 5) should be 2', () => {
    expect(bisect(values, 5)).toBe(2);
  });

  it('bisect(values, 1) should be 1', () => {
    expect(bisect(values, 1)).toBe(1);
  });

  it('bisect(values, -1) should be 0', () => {
    expect(bisect(values, -1)).toBe(0);
  });

  it('bisect(values, 20) should be 6', () => {
    expect(bisect(values, 20)).toBe(6);
  });

  it('bisect(values, 100) should be 6', () => {
    expect(bisect(values, 100)).toBe(6);
  });

  it('bisect(values, 100, 3, 6) should be 6', () => {
    expect(bisect(values, 100, 3, 6)).toBe(6);
  });
});

describe('findZeroOfFunction', () => {
  it('findZeroOfFunction()', () => {
    expect(findZeroOfFunction((entry: number) => entry - 5, 0, 100)).toBeCloseTo(5);
  });
});

describe('binaryFuzzySearch', () => {
  it('binaryFuzzySearch(5)', () => {
    expect(binaryFuzzySearch(values, (entry: number) => entry - 5)).toBe(1);
  });
  it('binaryFuzzySearch(2)', () => {
    expect(binaryFuzzySearch(values, (entry: number) => entry - 2)).toBe(1);
  });
  it('binaryFuzzySearch(1)', () => {
    expect(binaryFuzzySearch(values, (entry: number) => entry - 1)).toBe(0);
  });
  it('binaryFuzzySearch(-1)', () => {
    expect(binaryFuzzySearch(values, (entry: number) => entry + 1)).toBe(0);
  });
  it('binaryFuzzySearch(100)', () => {
    expect(binaryFuzzySearch(values, (entry: number) => entry - 100)).toBe(6);
  });
  it('binaryFuzzySearch(20)', () => {
    expect(binaryFuzzySearch(values, (entry: number) => entry - 20)).toBe(5);
  });
});
