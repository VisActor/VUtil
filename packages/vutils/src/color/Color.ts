/*
Copyright (c) 2013, Jason Davies.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

  * The name Jason Davies may not be used to endorse or promote products
    derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL JASON DAVIES BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Mike Bostock, https://github.com/d3/d3-color
/**
 * 参考 d3-color 实现。用于颜色转化
 * 16进制/rgb 转化为r，g，b， o
 */
import { clamp, isArray, isNil, isNumber, isValid } from '../common';
import hslToRgb from './hslToRgb';
import rgbToHsl from './rgbToHsl';

const REG_HEX = /^#([0-9a-f]{3,8})$/;

const DEFAULT_COLORS_OPACITY = {
  transparent: 0xffffff00
};

export const DEFAULT_COLORS = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

function hex(value: number) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? '0' : '') + value.toString(16);
}

function rgb(value: number | number[]): RGB {
  if (isNumber(value)) {
    return new RGB((value as number) >> 16, ((value as number) >> 8) & 0xff, (value as number) & 0xff, 1);
  } else if (isArray(value)) {
    return new RGB(value[0], value[1], value[2]);
  }

  // default return
  return new RGB(255, 255, 255);
}

function rgba(value: number | number[]): RGB {
  if (isNumber(value)) {
    return new RGB(
      (value as number) >>> 24,
      ((value as number) >>> 16) & 0xff,
      ((value as number) >>> 8) & 0xff,
      (value as number) & 0xff
    );
  } else if (isArray(value)) {
    return new RGB(value[0], value[1], value[2], value[3]);
  }

  // default return
  return new RGB(255, 255, 255, 1);
}

function SRGBToLinear(c: number) {
  return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

function LinearToSRGB(c: number) {
  return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
}

const setHex = (formatValue: string, forceHex?: boolean) => {
  const isHex = REG_HEX.exec(formatValue);

  if (forceHex || isHex) {
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

    return null;
  }

  return undefined;
};

export class Color {
  color!: RGB;

  static Brighter(source: string, b = 1) {
    if (b === 1) {
      return source;
    }
    return new Color(source).brighter(b).toRGBA();
  }

  static SetOpacity(source: string, o = 1) {
    if (o === 1) {
      return source;
    }
    return new Color(source).setOpacity(o).toRGBA();
  }

  static getColorBrightness(source: string | Color, model: 'hsv' | 'hsl' | 'lum' | 'lum2' | 'lum3' | 'wcag' = 'hsl') {
    const color = source instanceof Color ? source : new Color(source);
    switch (model) {
      case 'hsv':
        return color.getHSVBrightness();
      case 'hsl':
        return color.getHSLBrightness();
      case 'lum':
        return color.getLuminance();
      case 'lum2':
        return color.getLuminance2();
      case 'lum3':
        return color.getLuminance3();
      case 'wcag':
        return color.getLuminanceWCAG();
      default:
        return color.getHSVBrightness();
    }
  }

  static parseColorString(value: string) {
    // case0: transparent
    if (isValid(DEFAULT_COLORS_OPACITY[value])) {
      return rgba(DEFAULT_COLORS_OPACITY[value]);
    }

    // case1: 简写 ['blue','red']
    if (isValid(DEFAULT_COLORS[value])) {
      return rgb(DEFAULT_COLORS[value]);
    }
    const formatValue = `${value}`.trim().toLowerCase();

    // case2: 16进制
    const hexRes = setHex(formatValue);

    if (hexRes !== undefined) {
      return hexRes;
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

  constructor(value: string) {
    const color = Color.parseColorString(value);

    // case0: transparent
    if (color) {
      this.color = color;
    } else {
      // default: 白色
      console.warn(`Warn: 传入${value}无法解析为Color`);
      this.color = new RGB(255, 255, 255);
    }
  }
  toRGBA() {
    return this.color.formatRgb();
  }
  toString() {
    return this.color.formatRgb();
  }
  toHex() {
    return this.color.formatHex();
  }
  toHsl() {
    return this.color.formatHsl();
  }

  brighter(k: number) {
    const { r, g, b } = this.color;
    this.color.r = Math.max(0, Math.min(255, Math.floor(r * k)));
    this.color.g = Math.max(0, Math.min(255, Math.floor(g * k)));
    this.color.b = Math.max(0, Math.min(255, Math.floor(b * k)));
    return this;
  }

  add(color: Color) {
    const { r, g, b } = this.color;
    this.color.r += Math.min(255, r + color.color.r);
    this.color.g += Math.min(255, g + color.color.g);
    this.color.b += Math.min(255, b + color.color.b);
    return this;
  }

  sub(color: Color) {
    this.color.r = Math.max(0, this.color.r - color.color.r);
    this.color.g = Math.max(0, this.color.g - color.color.g);
    this.color.b = Math.max(0, this.color.b - color.color.b);
    return this;
  }

  multiply(color: Color) {
    const { r, g, b } = this.color;
    this.color.r = Math.max(0, Math.min(255, Math.floor(r * color.color.r)));
    this.color.g = Math.max(0, Math.min(255, Math.floor(g * color.color.g)));
    this.color.b = Math.max(0, Math.min(255, Math.floor(b * color.color.b)));
    return this;
  }

  // todo: 这里亮度计算都没考虑alpha通道
  getHSVBrightness() {
    return Math.max(this.color.r, this.color.g, this.color.b) / 255;
  }

  getHSLBrightness() {
    return (
      (Math.max(this.color.r, this.color.g, this.color.b) / 255 +
        Math.min(this.color.r, this.color.g, this.color.b) / 255) *
      0.5
    );
  }

  setHsl(h?: number | null | undefined, s?: number | null | undefined, l?: number | null | undefined) {
    const opacity = this.color.opacity;
    const hsl = rgbToHsl(this.color.r, this.color.g, this.color.b);

    const rgb = hslToRgb(
      isNil(h) ? hsl.h : clamp(h as number, 0, 360),
      isNil(s) ? hsl.s : s >= 0 && s <= 1 ? s * 100 : s,
      isNil(l) ? hsl.l : l <= 1 && l >= 0 ? l * 100 : l
    );
    this.color = new RGB(rgb.r, rgb.g, rgb.b, opacity);

    return this;
  }

  setRGB(r: number, g: number, b: number) {
    !isNil(r) && (this.color.r = r);
    !isNil(g) && (this.color.g = g);
    !isNil(b) && (this.color.b = b);

    return this;
  }

  setHex(value: string) {
    const formatValue = `${value}`.trim().toLowerCase();

    const res = setHex(formatValue, true);

    return res ?? this;
  }

  setColorName(name: string) {
    // color keywords
    const hex = DEFAULT_COLORS[name.toLowerCase()];

    if (typeof hex !== 'undefined') {
      // red
      this.setHex(hex);
    } else {
      // unknown color
      console.warn('THREE.Color: Unknown color ' + name);
    }

    return this;
  }

  setScalar(scalar: number) {
    this.color.r = scalar;
    this.color.g = scalar;
    this.color.b = scalar;
    return this;
  }

  setOpacity(o = 1) {
    this.color.opacity = o;
    return this;
  }

  getLuminance() {
    return (0.2126 * this.color.r + 0.7152 * this.color.g + 0.0722 * this.color.b) / 255;
  }

  getLuminance2() {
    return (0.2627 * this.color.r + 0.678 * this.color.g + 0.0593 * this.color.b) / 255;
  }

  getLuminance3() {
    return (0.299 * this.color.r + 0.587 * this.color.g + 0.114 * this.color.b) / 255;
  }

  /**
   * https://www.w3.org/TR/WCAG21/#use-of-color
   */
  getLuminanceWCAG() {
    const RsRGB = this.color.r / 255;
    const GsRGB = this.color.g / 255;
    const BsRGB = this.color.b / 255;
    let R;
    let G;
    let B;
    if (RsRGB <= 0.03928) {
      R = RsRGB / 12.92;
    } else {
      R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
    }
    if (GsRGB <= 0.03928) {
      G = GsRGB / 12.92;
    } else {
      G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
    }
    if (BsRGB <= 0.03928) {
      B = BsRGB / 12.92;
    } else {
      B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
    }
    const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return L;
  }

  clone() {
    return new Color(this.color.toString());
  }

  copyGammaToLinear(color: Color, gammaFactor = 2.0) {
    this.color.r = Math.pow(color.color.r, gammaFactor);
    this.color.g = Math.pow(color.color.g, gammaFactor);
    this.color.b = Math.pow(color.color.b, gammaFactor);
    return this;
  }

  copyLinearToGamma(color: Color, gammaFactor = 2.0) {
    const safeInverse = gammaFactor > 0 ? 1.0 / gammaFactor : 1.0;

    this.color.r = Math.pow(color.color.r, safeInverse);
    this.color.g = Math.pow(color.color.g, safeInverse);
    this.color.b = Math.pow(color.color.b, safeInverse);

    return this;
  }

  convertGammaToLinear(gammaFactor: number) {
    this.copyGammaToLinear(this, gammaFactor);
    return this;
  }

  convertLinearToGamma(gammaFactor: number) {
    this.copyLinearToGamma(this, gammaFactor);
    return this;
  }

  copySRGBToLinear(color: Color) {
    this.color.r = SRGBToLinear(color.color.r);
    this.color.g = SRGBToLinear(color.color.g);
    this.color.b = SRGBToLinear(color.color.b);
    return this;
  }

  copyLinearToSRGB(color: Color) {
    this.color.r = LinearToSRGB(color.color.r);
    this.color.g = LinearToSRGB(color.color.g);
    this.color.b = LinearToSRGB(color.color.b);
    return this;
  }

  convertSRGBToLinear() {
    this.copySRGBToLinear(this);
    return this;
  }

  convertLinearToSRGB() {
    this.copyLinearToSRGB(this);
    return this;
  }
}

export class RGB {
  r: number;
  g: number;
  b: number;
  opacity: number;
  constructor(r: number, g: number, b: number, opacity?: number) {
    this.r = isNaN(+r) ? 255 : Math.max(0, Math.min(255, +r));
    this.g = isNaN(+g) ? 255 : Math.max(0, Math.min(255, +g));
    this.b = isNaN(+b) ? 255 : Math.max(0, Math.min(255, +b));

    if (isValid(opacity)) {
      this.opacity = isNaN(+(opacity as number)) ? 1 : Math.max(0, Math.min(1, +(opacity as number)));
    } else {
      this.opacity = 1;
    }
  }
  // 转为16进制
  formatHex() {
    return `#${hex(this.r) + hex(this.g) + hex(this.b) + (this.opacity === 1 ? '' : hex(this.opacity * 255))}`;
  }
  formatRgb() {
    const opacity = this.opacity;
    return `${opacity === 1 ? 'rgb(' : 'rgba('}${this.r},${this.g},${this.b}${opacity === 1 ? ')' : `,${opacity})`}`;
  }

  formatHsl() {
    const opacity = this.opacity;
    const { h, s, l } = rgbToHsl(this.r, this.g, this.b);

    return `${opacity === 1 ? 'hsl(' : 'hsla('}${h},${s}%,${l}%${opacity === 1 ? ')' : `,${opacity})`}`;
  }
  // 转为16进制
  toString() {
    return this.formatHex();
  }
}
