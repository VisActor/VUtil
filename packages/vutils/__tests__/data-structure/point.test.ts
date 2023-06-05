import { Point } from '../../src/index';

describe('Point', () => {
  it('new Point(x,y,x1,y1), x1 and y1 should be set', () => {
    const point = new Point(1, 1, 1, 1);

    expect(point.x).toBe(1);
    expect(point.y).toBe(1);
    expect(point.x1).toBe(1);
    expect(point.y1).toBe(1);
  });
});
