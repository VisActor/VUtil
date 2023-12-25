import { isValid } from '../common';
import { RGB } from './RGB';
import { DEFAULT_COLORS } from './defaultColors';
import hslToRgb from './hslToRgb';
import { rgb, rgba } from './numberToRgb';

const DEFAULT_COLORS_OPACITY = {
  transparent: 0xffffff00
};

export const REG_HEX = /^#([0-9a-f]{3,8})$/;

export function parseColorString(color: string) {
  // case0: transparent
  if (isValid(DEFAULT_COLORS_OPACITY[color])) {
    return rgba(DEFAULT_COLORS_OPACITY[color]);
  }

  // case1: 简写 ['blue','red']
  if (isValid(DEFAULT_COLORS[color])) {
    return rgb(DEFAULT_COLORS[color]);
  }
  const formatValue = `${color}`.trim().toLowerCase();
  const isHex = REG_HEX.exec(formatValue);

  // case2: 16进制
  if (isHex) {
    const hex = parseInt(isHex[1], 16);
    const hexLength = isHex[1].length;
    // #fff
    if (hexLength === 3) {
      return new RGB(
        ((hex >> 8) & 0xf) + (((hex >> 8) & 0xf) << 4),
        ((hex >> 4) & 0xf) + (((hex >> 4) & 0xf) << 4),
        (hex & 0xf) + ((hex & 0xf) << 4),
        1
      );
    }
    // #ffffff
    if (hexLength === 6) {
      return rgb(hex);
    }
    // #ffffffaa
    else if (hexLength === 8) {
      return new RGB((hex >> 24) & 0xff, (hex >> 16) & 0xff, (hex >> 8) & 0xff, (hex & 0xff) / 0xff);
    }

    return;
  }

  // case3 : rgb
  if (/^(rgb|RGB|rgba|RGBA)/.test(formatValue)) {
    const aColor = formatValue.replace(/(?:\(|\)|rgba|RGBA|rgb|RGB)*/g, '').split(',');
    return new RGB(parseInt(aColor[0], 10), parseInt(aColor[1], 10), parseInt(aColor[2], 10), parseFloat(aColor[3]));
  }

  // case4: hsl
  if (/^(hsl|HSL|hsla|HSLA)/.test(formatValue)) {
    const aColor = formatValue.replace(/(?:\(|\)|hsla|HSLA|hsl|HSL)*/g, '').split(',');
    const rgb = hslToRgb(parseInt(aColor[0], 10), parseInt(aColor[1], 10), parseInt(aColor[2], 10));

    return new RGB(rgb.r, rgb.g, rgb.b, parseFloat(aColor[3]));
  }

  return;
}
