import { calculateAnchorOfBounds, Bounds, OBBBounds } from '../../src';

describe('bounds utils', () => {
  it('calculateAnchorOfBounds', () => {
    const bounds = new Bounds().set(50, 50, 100, 100);

    expect(calculateAnchorOfBounds(bounds, 'top')).toEqual({ x: 75, y: 50 });
    expect(calculateAnchorOfBounds(bounds, 'top-left')).toEqual({ x: 50, y: 50 });
    expect(calculateAnchorOfBounds(bounds, 'top-right')).toEqual({ x: 100, y: 50 });

    expect(calculateAnchorOfBounds(bounds, 'left')).toEqual({ x: 50, y: 75 });
    expect(calculateAnchorOfBounds(bounds, 'center')).toEqual({ x: 75, y: 75 });
    expect(calculateAnchorOfBounds(bounds, 'right')).toEqual({ x: 100, y: 75 });

    expect(calculateAnchorOfBounds(bounds, 'bottom-left')).toEqual({ x: 50, y: 100 });
    expect(calculateAnchorOfBounds(bounds, 'bottom')).toEqual({ x: 75, y: 100 });
    expect(calculateAnchorOfBounds(bounds, 'bottom-right')).toEqual({ x: 100, y: 100 });

    expect(calculateAnchorOfBounds(bounds, 'inside-top')).toEqual({ x: 75, y: 50 });
    expect(calculateAnchorOfBounds(bounds, 'inside-bottom')).toEqual({ x: 75, y: 100 });
    expect(calculateAnchorOfBounds(bounds, 'inside-left')).toEqual({ x: 50, y: 75 });
    expect(calculateAnchorOfBounds(bounds, 'inside-right')).toEqual({ x: 100, y: 75 });
  });
});

describe('OBB intersect', () => {
  it('intersects', () => {
    const a = new OBBBounds();
    const b = new OBBBounds();
    a.setValue(-2.644351612437859, 28.00798797607422, 41.37162433971058, 40.00798797607422, 1.5707963267948966);
    b.setValue(21.90184229070489, 29.27997589111329, 68.46179407293147, 41.27997589111329, 1.5707963267948966);

    expect(a.intersects(b)).toBe(false);
  });
});
