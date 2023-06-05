import { ColorUtil } from '../../src';

describe('interpolateRgb', () => {
  it('interpolateRgb(RGB(255, 0, 0), RGB(0,0, 255))', () => {
    const red = new ColorUtil.Color('red').color;
    const blue = new ColorUtil.Color('blue').color;
    const interpolate = ColorUtil.interpolateRgb(red, blue);

    expect(interpolate(0).toString()).toBe('#ff0000');
    expect(interpolate(0.5).toString()).toBe('#800080');
    expect(interpolate(1).toString()).toBe('#0000ff');
  });

  it('interpolateRgb(RGB(255, 0, 0, 0.2), RGB(0,0, 255, 0.8))', () => {
    const red = new ColorUtil.Color('rgba(255, 0, 0, 0.2)').color;
    const blue = new ColorUtil.Color('rgba(0, 0, 255, 0.8)').color;
    const interpolate = ColorUtil.interpolateRgb(red, blue);

    expect(red.opacity).toBeCloseTo(0.2);
    expect(blue.opacity).toBeCloseTo(0.8);
    expect(interpolate(0).formatRgb()).toBe('rgba(255,0,0,0.2)');
    expect(interpolate(0.5).formatRgb()).toBe('rgba(128,0,128,0.5)');
    expect(interpolate(1).formatRgb()).toBe('rgba(0,0,255,0.8)');

    expect(interpolate(0).toString()).toBe('#ff000033');
    expect(interpolate(0.5).toString()).toBe('#80008080');
    expect(interpolate(1).toString()).toBe('#0000ffcc');
  });
});
