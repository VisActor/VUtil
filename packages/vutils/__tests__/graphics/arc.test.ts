import { calculateAnchorOfArc } from '../../src';

describe('arc', () => {
  it('calculateAnchorOfArc', () => {
    const arcAttr = {
      innerRadius: 50,
      outerRadius: 70,
      startAngle: 0,
      endAngle: 2
    };

    expect(calculateAnchorOfArc(arcAttr, 'inner-start')).toEqual({ angle: 0, radius: 50 });
    expect(calculateAnchorOfArc(arcAttr, 'inner-end')).toEqual({ angle: 2, radius: 50 });
    expect(calculateAnchorOfArc(arcAttr, 'inner-middle')).toEqual({ angle: 1, radius: 50 });
    expect(calculateAnchorOfArc(arcAttr, 'outer-start')).toEqual({ angle: 0, radius: 70 });
    expect(calculateAnchorOfArc(arcAttr, 'outer-end')).toEqual({ angle: 2, radius: 70 });
    expect(calculateAnchorOfArc(arcAttr, 'outer-middle')).toEqual({ angle: 1, radius: 70 });
    expect(calculateAnchorOfArc(arcAttr, 'center')).toEqual({ angle: 1, radius: 60 });
  });
});
