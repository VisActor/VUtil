import { calculateAnchorOfBounds, Bounds } from '../../src';

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
