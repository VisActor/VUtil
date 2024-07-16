import { ColorUtil } from '../../src';

describe('parseColorString', () => {
  it('parseColorString("transparent") should return RGB color', () => {
    const color = ColorUtil.Color.parseColorString('transparent');
    expect(color).toBeDefined();
  });

  it('parseColorString("transparent") should return not RGB color', () => {
    const color = ColorUtil.Color.parseColorString('any');
    expect(color).toBeUndefined();
  });

  it('parseColorString("#ff73") should return not RGB color', () => {
    const color = ColorUtil.Color.parseColorString('#ff73');
    expect(color).toBeNull();
  });

  it('parseColorString("#ff7") should return RGB color', () => {
    const color = ColorUtil.Color.parseColorString('#ff7');
    expect(color).toBeDefined();
  });

  it('parseColorString("rgba(233, 255, 0)") should return RGB color', () => {
    const color = ColorUtil.Color.parseColorString('rgba(233, 255, 0)');
    expect(color).toBeDefined();
  });

  it('parseColorString("hsl(0, 100%, 50%)") should return RGB color', () => {
    const color = ColorUtil.Color.parseColorString('hsl(0, 100%, 50%)');
    expect(color).toBeDefined();
    expect(color?.formatHex()).toBe('#ff0000');
  });

  it('parseColorString("hsla(0, 100%, 50%, 0.5)") should return RGB color', () => {
    const color = ColorUtil.Color.parseColorString('hsla(0, 100%, 50%, 0.5)');
    expect(color).toBeDefined();
    expect(color?.formatHex()).toBe('#ff000080');

    expect(color?.formatHsl()).toBe('hsla(0,100%,50%,0.5)');
  });
});

describe('setHsl', () => {
  it('set Hue', () => {
    const color = new ColorUtil.Color('#ff0000');

    expect(color.toHsl()).toBe('hsl(0,100%,50%)');

    expect(color.setHsl(120).toHsl()).toBe('hsl(120,100%,50%)');

    expect(color.setHsl(null, null, 0.26).toHsl()).toBe('hsl(120,100%,26.1%)');
  });
});
