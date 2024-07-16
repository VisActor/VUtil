import {
  isIntersect,
  getIntersectPoint,
  getRectIntersect,
  rectInsideAnotherRect,
  isRectIntersect,
  pointInRect,
  isRotateAABBIntersect
} from '../../src';

describe('intersects', () => {
  it('isIntersect', () => {
    expect(isIntersect([0, 0], [100, 100], [50, 20], [0, 100])).toBeTruthy();
  });

  it('getIntersectPoint', () => {
    const p = getIntersectPoint([0, 0], [100, 100], [50, 20], [0, 100]);
    expect(p[0]).toBeCloseTo(38.46153846153847);
    expect(p[1]).toBeCloseTo(38.46153846153847);
  });

  it('getRectIntersect', () => {
    const p = getRectIntersect(
      {
        x1: 0,
        x2: 50,
        y1: 0,
        y2: 100
      },
      {
        x1: 30,
        y1: 30,
        x2: 100,
        y2: 150
      },
      true
    );
    expect(p).toEqual({ x1: 30, x2: 50, y1: 30, y2: 100 });
  });
});
