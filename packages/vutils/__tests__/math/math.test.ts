import { precisionAdd, precisionSub, pointAt } from '../../src/math';

describe('precision', () => {
  it('precision add', () => {
    expect(precisionAdd(0.1, 0.2)).toBe(0.3);
  });
  it('precision sub', () => {
    expect(precisionSub(33, 23.33)).toBe(9.67);
  });
});

describe('pointAt', () => {
  it('pointAt of normal points', () => {
    expect(pointAt(1, 1, 3, 5, 0.5)).toEqual({ x: 2, y: 3 });
  });
  it('pointAt of undefined points', () => {
    expect(pointAt(1, undefined, 3, 5, 0.5)).toEqual({ x: 2, y: 5 });
    expect(pointAt(undefined, 1, 3, 5, 0.5)).toEqual({ x: 3, y: 3 });
    expect(pointAt(1, 1, 3, undefined, 0.5)).toEqual({ x: 2, y: undefined });
    expect(pointAt(1, 1, undefined, 5, 0.5)).toEqual({ x: undefined, y: 3 });
  });
});
