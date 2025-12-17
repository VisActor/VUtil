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

/**
 * 带透明度的默认颜色（RGBA格式）
 * 说明：此表中定义的颜色包含透明通道，值格式为 0xRRGGBBAA。
 */
export const DEFAULT_COLORS_OPACITY = {
  /** 透明色（完全透明，白底） */
  transparent: 0xffffff00
};

/**
 * 默认颜色映射表（CSS标准颜色名称 → 十六进制RGB值）
 */
export const DEFAULT_COLORS = {
  /** 爱丽丝蓝 */
  aliceblue: 0xf0f8ff,
  /** 米白色 / 古董白 */
  antiquewhite: 0xfaebd7,
  /** 浅绿色 / 水色 */
  aqua: 0x00ffff,
  /** 碧绿色 / 海蓝色 */
  aquamarine: 0x7fffd4,
  /** 蔚蓝色 */
  azure: 0xf0ffff,
  /** 米色 */
  beige: 0xf5f5dc,
  /** 橘黄色 / 陶坯色 */
  bisque: 0xffe4c4,
  /** 黑色 */
  black: 0x000000,
  /** 杏仁白 */
  blanchedalmond: 0xffebcd,
  /** 蓝色 */
  blue: 0x0000ff,
  /** 蓝紫色 */
  blueviolet: 0x8a2be2,
  /** 棕色 */
  brown: 0xa52a2a,
  /** 实木色 / 原木色 */
  burlywood: 0xdeb887,
  /** 军兰色 */
  cadetblue: 0x5f9ea0,
  /** 黄绿色 / 查特酒绿 */
  chartreuse: 0x7fff00,
  /** 巧克力色 */
  chocolate: 0xd2691e,
  /** 珊瑚色 */
  coral: 0xff7f50,
  /** 矢车菊蓝 */
  cornflowerblue: 0x6495ed,
  /** 玉米丝色 */
  cornsilk: 0xfff8dc,
  /** 深红色 / 猩红色 */
  crimson: 0xdc143c,
  /** 青色 */
  cyan: 0x00ffff,
  /** 深蓝色 */
  darkblue: 0x00008b,
  /** 深青色 */
  darkcyan: 0x008b8b,
  /** 深金菊色 */
  darkgoldenrod: 0xb8860b,
  /** 深灰色 */
  darkgray: 0xa9a9a9,
  /** 深绿色 */
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  /** 深卡其色 */
  darkkhaki: 0xbdb76b,
  /** 深洋红 */
  darkmagenta: 0x8b008b,
  /** 深橄榄绿 */
  darkolivegreen: 0x556b2f,
  /** 深橙色 */
  darkorange: 0xff8c00,
  /** 深兰花紫 */
  darkorchid: 0x9932cc,
  /** 深红色 */
  darkred: 0x8b0000,
  /** 深鲑红色 */
  darksalmon: 0xe9967a,
  /** 深海绿色 */
  darkseagreen: 0x8fbc8f,
  /** 深石板蓝 */
  darkslateblue: 0x483d8b,
  /** 深石板灰 */
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  /** 深松石绿 */
  darkturquoise: 0x00ced1,
  /** 深紫罗兰 */
  darkviolet: 0x9400d3,
  /** 深粉红色 */
  deeppink: 0xff1493,
  /** 深天蓝色 */
  deepskyblue: 0x00bfff,
  /** 暗灰色 */
  dimgray: 0x696969,
  dimgrey: 0x696969,
  /** 闪兰色 / 道奇蓝 */
  dodgerblue: 0x1e90ff,
  /** 火砖色 */
  firebrick: 0xb22222,
  /** 花卉白 */
  floralwhite: 0xfffaf0,
  /** 森林绿 */
  forestgreen: 0x228b22,
  /** 紫红色 / 品红 */
  fuchsia: 0xff00ff,
  /** 亮灰色 */
  gainsboro: 0xdcdcdc,
  /** 幽灵白 */
  ghostwhite: 0xf8f8ff,
  /** 金色 */
  gold: 0xffd700,
  /** 金菊色 */
  goldenrod: 0xdaa520,
  /** 灰色 */
  gray: 0x808080,
  /** 绿色 */
  green: 0x008000,
  /** 黄绿色 */
  greenyellow: 0xadff2f,
  grey: 0x808080,
  /** 蜜露色 */
  honeydew: 0xf0fff0,
  /** 鲜粉色 */
  hotpink: 0xff69b4,
  /** 印度红 */
  indianred: 0xcd5c5c,
  /** 靛青色 */
  indigo: 0x4b0082,
  /** 象牙白 */
  ivory: 0xfffff0,
  /** 卡其色 */
  khaki: 0xf0e68c,
  /** 薰衣草紫 */
  lavender: 0xe6e6fa,
  /** 淡紫红 */
  lavenderblush: 0xfff0f5,
  /** 草坪绿 */
  lawngreen: 0x7cfc00,
  /** 柠檬绸色 */
  lemonchiffon: 0xfffacd,
  /** 淡蓝色 */
  lightblue: 0xadd8e6,
  /** 淡珊瑚色 */
  lightcoral: 0xf08080,
  /** 淡青色 */
  lightcyan: 0xe0ffff,
  /** 淡金菊黄 */
  lightgoldenrodyellow: 0xfafad2,
  /** 淡灰色 */
  lightgray: 0xd3d3d3,
  /** 淡绿色 */
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  /** 淡粉色 */
  lightpink: 0xffb6c1,
  /** 淡鲑红色 */
  lightsalmon: 0xffa07a,
  /** 浅海绿色 */
  lightseagreen: 0x20b2aa,
  /** 浅天蓝 */
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  /** 浅钢蓝 */
  lightsteelblue: 0xb0c4de,
  /** 淡黄色 */
  lightyellow: 0xffffe0,
  /** 酸橙绿 */
  lime: 0x00ff00,
  /** 亮绿色 */
  limegreen: 0x32cd32,
  /** 亚麻色 */
  linen: 0xfaf0e6,
  /** 品红色 */
  magenta: 0xff00ff,
  /** 栗色 / 红褐色 */
  maroon: 0x800000,
  /** 中碧绿 */
  mediumaquamarine: 0x66cdaa,
  /** 中蓝色 */
  mediumblue: 0x0000cd,
  /** 中兰花紫 */
  mediumorchid: 0xba55d3,
  /** 中紫色 */
  mediumpurple: 0x9370db,
  /** 中海绿色 */
  mediumseagreen: 0x3cb371,
  /** 中石板蓝 */
  mediumslateblue: 0x7b68ee,
  /** 中春绿色 */
  mediumspringgreen: 0x00fa9a,
  /** 中松石绿 */
  mediumturquoise: 0x48d1cc,
  /** 中紫罗兰红 */
  mediumvioletred: 0xc71585,
  /** 午夜蓝 */
  midnightblue: 0x191970,
  /** 薄荷乳白 */
  mintcream: 0xf5fffa,
  /** 雾玫瑰色 */
  mistyrose: 0xffe4e1,
  /** 鹿皮色 */
  moccasin: 0xffe4b5,
  /** 纳瓦白 */
  navajowhite: 0xffdead,
  /** 藏青色 / 海军蓝 */
  navy: 0x000080,
  /** 老花蕾丝色 */
  oldlace: 0xfdf5e6,
  /** 橄榄色 */
  olive: 0x808000,
  /** 橄榄褐色 */
  olivedrab: 0x6b8e23,
  /** 橙色 */
  orange: 0xffa500,
  /** 橙红色 */
  orangered: 0xff4500,
  /** 兰花紫 */
  orchid: 0xda70d6,
  /** 浅金菊色 */
  palegoldenrod: 0xeee8aa,
  /** 浅绿色 */
  palegreen: 0x98fb98,
  /** 浅松石绿 */
  paleturquoise: 0xafeeee,
  /** 浅紫红色 */
  palevioletred: 0xdb7093,
  /** 木瓜色 */
  papayawhip: 0xffefd5,
  /** 桃色 */
  peachpuff: 0xffdab9,
  /** 秘鲁色 */
  peru: 0xcd853f,
  /** 粉色 */
  pink: 0xffc0cb,
  /** 李子紫 */
  plum: 0xdda0dd,
  /** 粉蓝色 */
  powderblue: 0xb0e0e6,
  /** 紫色 */
  purple: 0x800080,
  /** 丽贝卡紫 */
  rebeccapurple: 0x663399,
  /** 红色 */
  red: 0xff0000,
  /** 玫瑰棕 */
  rosybrown: 0xbc8f8f,
  /** 皇家蓝 */
  royalblue: 0x4169e1,
  /** 鞍褐色 */
  saddlebrown: 0x8b4513,
  /** 鲑红色 */
  salmon: 0xfa8072,
  /** 沙褐色 */
  sandybrown: 0xf4a460,
  /** 海绿色 */
  seagreen: 0x2e8b57,
  /** 海贝色 */
  seashell: 0xfff5ee,
  /** 赭色 */
  sienna: 0xa0522d,
  /** 银色 */
  silver: 0xc0c0c0,
  /** 天蓝色 */
  skyblue: 0x87ceeb,
  /** 石板蓝 */
  slateblue: 0x6a5acd,
  /** 石板灰 */
  slategray: 0x708090,
  slategrey: 0x708090,
  /** 雪白色 */
  snow: 0xfffafa,
  /** 春绿色 */
  springgreen: 0x00ff7f,
  /** 钢蓝色 */
  steelblue: 0x4682b4,
  /** 茶色 / 棕褐色 */
  tan: 0xd2b48c,
  /** 水鸭色 / 深青 */
  teal: 0x008080,
  /** 蓟紫色 */
  thistle: 0xd8bfd8,
  /** 番茄红 */
  tomato: 0xff6347,
  /** 松石绿 */
  turquoise: 0x40e0d0,
  /** 紫罗兰色 */
  violet: 0xee82ee,
  /** 小麦色 */
  wheat: 0xf5deb3,
  /** 白色 */
  white: 0xffffff,
  /** 烟白色 */
  whitesmoke: 0xf5f5f5,
  /** 黄色 */
  yellow: 0xffff00,
  /** 黄绿色 */
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

/**
 * Color 颜色处理类
 * 提供多种颜色解析与转换功能，包括 HEX / RGB(A) / HSL(A) / HSV / Luminance 等模式，
 * 并支持亮度调整、通道变换、透明度控制、Gamma / sRGB 校正等操作。
 */
export class Color {
  /** 当前颜色对象（RGB实例） */
  color!: RGB;

  /**
   * 调整颜色亮度（静态方法）
   * @param source 原始颜色字符串（支持 #RRGGBB、rgb(...)、颜色名等格式）
   * @param b 亮度倍数，>1 变亮，<1 变暗，默认 1
   * @returns 调整后的颜色字符串（RGBA格式）
   */
  static Brighter(source: string, b = 1) {
    if (b === 1) {
      return source;
    }
    return new Color(source).brighter(b).toRGBA();
  }

  /**
   * 设置颜色透明度（静态方法）
   * @param source 原始颜色字符串
   * @param o 新的透明度（0~1）
   * @returns 设置透明度后的颜色字符串（RGBA格式）
   */
  static SetOpacity(source: string, o = 1) {
    if (o === 1) {
      return source;
    }
    return new Color(source).setOpacity(o).toRGBA();
  }

  /**
   * 获取颜色亮度值（多模型支持）
   * @param source 颜色字符串或 Color 实例
   * @param model 亮度模型（'hsv' | 'hsl' | 'lum' | 'lum2' | 'lum3' | 'wcag'）
   * @returns 亮度值（0~1）
   */
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

  /**
   * 解析颜色字符串为 RGB 实例
   * 支持多种格式：
   * - CSS颜色名（如 "red"、"blue"）
   * - HEX 十六进制颜色（如 "#ff0000"、"#fff"）
   * - RGB(A) 字符串（如 "rgba(255,0,0,0.5)"）
   * - HSL(A) 字符串（如 "hsl(0,100%,50%)"）
   * - 特殊值 "transparent"
   */
  static parseColorString(value: string) {
    // case0: transparent（透明色）
    if (isValid(DEFAULT_COLORS_OPACITY[value as 'transparent'])) {
      return rgba(DEFAULT_COLORS_OPACITY[value as 'transparent']);
    }

    // case1: 简写颜色名（如 'blue', 'red'）
    if (isValid(DEFAULT_COLORS[value as 'blue'])) {
      return rgb(DEFAULT_COLORS[value as 'blue']);
    }

    const formatValue = `${value}`.trim().toLowerCase();

    // case2: HEX 格式 (#rrggbb / #rgb)
    const hexRes = setHex(formatValue);
    if (hexRes !== undefined) {
      return hexRes;
    }

    // case3: RGB(A) 格式
    if (/^(rgb|RGB|rgba|RGBA)/.test(formatValue)) {
      const aColor = formatValue.replace(/(?:\(|\)|rgba|RGBA|rgb|RGB)*/g, '').split(',');
      return new RGB(parseInt(aColor[0], 10), parseInt(aColor[1], 10), parseInt(aColor[2], 10), parseFloat(aColor[3]));
    }

    // case4: HSL(A) 格式
    if (/^(hsl|HSL|hsla|HSLA)/.test(formatValue)) {
      const aColor = formatValue.replace(/(?:\(|\)|hsla|HSLA|hsl|HSL)*/g, '').split(',');
      const rgb = hslToRgb(parseInt(aColor[0], 10), parseInt(aColor[1], 10), parseInt(aColor[2], 10));
      return new RGB(rgb.r, rgb.g, rgb.b, parseFloat(aColor[3]));
    }

    return;
  }

  /**
   * 构造函数：根据输入值解析并创建颜色实例
   * @param value 颜色字符串
   */
  constructor(value: string) {
    const color = Color.parseColorString(value);
    if (color) {
      this.color = color;
    } else {
      // 默认白色
      console.warn(`Warn: 传入${value}无法解析为Color`);
      this.color = new RGB(255, 255, 255);
    }
  }

  /** 返回 RGBA 字符串 */
  toRGBA() {
    return this.color.formatRgb();
  }

  /** 同 toRGBA */
  toString() {
    return this.color.formatRgb();
  }

  /** 返回 HEX 字符串 */
  toHex() {
    return this.color.formatHex();
  }

  /** 返回 HSL 字符串 */
  toHsl() {
    return this.color.formatHsl();
  }

  /**
   * 调整亮度（乘法系数）
   * @param k 亮度系数，>1 变亮，<1 变暗
   */
  brighter(k: number) {
    const { r, g, b } = this.color;
    this.color.r = Math.max(0, Math.min(255, Math.floor(r * k)));
    this.color.g = Math.max(0, Math.min(255, Math.floor(g * k)));
    this.color.b = Math.max(0, Math.min(255, Math.floor(b * k)));
    return this;
  }

  /**
   * 与另一颜色相加（通道叠加）
   */
  add(color: Color) {
    const { r, g, b } = this.color;
    this.color.r += Math.min(255, r + color.color.r);
    this.color.g += Math.min(255, g + color.color.g);
    this.color.b += Math.min(255, b + color.color.b);
    return this;
  }

  /**
   * 与另一颜色相减（通道减法）
   */
  sub(color: Color) {
    this.color.r = Math.max(0, this.color.r - color.color.r);
    this.color.g = Math.max(0, this.color.g - color.color.g);
    this.color.b = Math.max(0, this.color.b - color.color.b);
    return this;
  }

  /**
   * 通道乘法（颜色混合用）
   */
  multiply(color: Color) {
    const { r, g, b } = this.color;
    this.color.r = Math.max(0, Math.min(255, Math.floor(r * color.color.r)));
    this.color.g = Math.max(0, Math.min(255, Math.floor(g * color.color.g)));
    this.color.b = Math.max(0, Math.min(255, Math.floor(b * color.color.b)));
    return this;
  }

  // todo: 这里亮度计算都没考虑alpha通道
  /** HSV 模型亮度（取最大通道值） */
  getHSVBrightness() {
    return Math.max(this.color.r, this.color.g, this.color.b) / 255;
  }

  /** HSL 模型亮度（最大最小平均值） */
  getHSLBrightness() {
    return (
      (Math.max(this.color.r, this.color.g, this.color.b) / 255 +
        Math.min(this.color.r, this.color.g, this.color.b) / 255) *
      0.5
    );
  }

  /**
   * 设置 HSL 值
   * @param h 色相 (0~360)
   * @param s 饱和度 (0~1 或 0~100)
   * @param l 亮度 (0~1 或 0~100)
   */
  setHsl(h?: number | null, s?: number | null, l?: number | null) {
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

  /** 设置 RGB 通道 */
  setRGB(r: number, g: number, b: number) {
    !isNil(r) && (this.color.r = r);
    !isNil(g) && (this.color.g = g);
    !isNil(b) && (this.color.b = b);
    return this;
  }

  /** 设置 HEX 颜色值 */
  setHex(value: string) {
    const formatValue = `${value}`.trim().toLowerCase();
    const res = setHex(formatValue, true);
    return res ?? this;
  }

  /** 设置颜色名（如 'red'、'blue'） */
  setColorName(name: string) {
    const hex = DEFAULT_COLORS[name.toLowerCase() as keyof typeof DEFAULT_COLORS];
    if (typeof hex !== 'undefined') {
      this.setHex(hex.toString());
    } else {
      // unknown color
      console.warn('THREE.Color: Unknown color ' + name);
    }
    return this;
  }

  /** 设置所有通道为同一标量值（灰度化等） */
  setScalar(scalar: number) {
    this.color.r = scalar;
    this.color.g = scalar;
    this.color.b = scalar;
    return this;
  }

  /** 设置透明度 */
  setOpacity(o = 1) {
    this.color.opacity = o;
    return this;
  }

  /** 计算亮度（标准Luminance公式1） */
  getLuminance() {
    return (0.2126 * this.color.r + 0.7152 * this.color.g + 0.0722 * this.color.b) / 255;
  }

  /** 亮度计算方式2 */
  getLuminance2() {
    return (0.2627 * this.color.r + 0.678 * this.color.g + 0.0593 * this.color.b) / 255;
  }

  /** 亮度计算方式3（旧版电视系数） */
  getLuminance3() {
    return (0.299 * this.color.r + 0.587 * this.color.g + 0.114 * this.color.b) / 255;
  }

  /**
   * 按照 WCAG 标准计算亮度（人眼感知亮度）
   * 参考：https://www.w3.org/TR/WCAG21/#use-of-color
   */
  getLuminanceWCAG() {
    const RsRGB = this.color.r / 255;
    const GsRGB = this.color.g / 255;
    const BsRGB = this.color.b / 255;
    const R = RsRGB <= 0.03928 ? RsRGB / 12.92 : Math.pow((RsRGB + 0.055) / 1.055, 2.4);
    const G = GsRGB <= 0.03928 ? GsRGB / 12.92 : Math.pow((GsRGB + 0.055) / 1.055, 2.4);
    const B = BsRGB <= 0.03928 ? BsRGB / 12.92 : Math.pow((BsRGB + 0.055) / 1.055, 2.4);
    const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return L;
  }

  /** 克隆当前颜色对象 */
  clone() {
    return new Color(this.color.toString());
  }

  /** 从Gamma空间转换为线性空间 */
  copyGammaToLinear(color: Color, gammaFactor = 2.0) {
    this.color.r = Math.pow(color.color.r, gammaFactor);
    this.color.g = Math.pow(color.color.g, gammaFactor);
    this.color.b = Math.pow(color.color.b, gammaFactor);
    return this;
  }

  /** 从线性空间转换为Gamma空间 */
  copyLinearToGamma(color: Color, gammaFactor = 2.0) {
    const safeInverse = gammaFactor > 0 ? 1.0 / gammaFactor : 1.0;
    this.color.r = Math.pow(color.color.r, safeInverse);
    this.color.g = Math.pow(color.color.g, safeInverse);
    this.color.b = Math.pow(color.color.b, safeInverse);
    return this;
  }

  /** 将自身从Gamma空间转换为线性空间 */
  convertGammaToLinear(gammaFactor: number) {
    this.copyGammaToLinear(this, gammaFactor);
    return this;
  }

  /** 将自身从线性空间转换为Gamma空间 */
  convertLinearToGamma(gammaFactor: number) {
    this.copyLinearToGamma(this, gammaFactor);
    return this;
  }

  /** 从 sRGB 空间转换为线性空间 */
  copySRGBToLinear(color: Color) {
    this.color.r = SRGBToLinear(color.color.r);
    this.color.g = SRGBToLinear(color.color.g);
    this.color.b = SRGBToLinear(color.color.b);
    return this;
  }

  /** 从线性空间转换为 sRGB 空间 */
  copyLinearToSRGB(color: Color) {
    this.color.r = LinearToSRGB(color.color.r);
    this.color.g = LinearToSRGB(color.color.g);
    this.color.b = LinearToSRGB(color.color.b);
    return this;
  }

  /** 将自身从 sRGB 转线性空间 */
  convertSRGBToLinear() {
    this.copySRGBToLinear(this);
    return this;
  }

  /** 将自身从线性空间转 sRGB */
  convertLinearToSRGB() {
    this.copyLinearToSRGB(this);
    return this;
  }
}

/**
 * RGB 颜色类
 * 用于表示颜色的红 (R)、绿 (G)、蓝 (B) 三原色分量及透明度 (opacity)，
 * 并提供多种格式化输出（HEX / RGB(A) / HSL(A)）。
 */
export class RGB {
  /** 红色分量（0~255） */
  r: number;
  /** 绿色分量（0~255） */
  g: number;
  /** 蓝色分量（0~255） */
  b: number;
  /** 不透明度（0~1） */
  opacity: number;

  /**
   * 构造函数
   * @param r 红色分量（0~255）
   * @param g 绿色分量（0~255）
   * @param b 蓝色分量（0~255）
   * @param opacity 可选透明度（0~1，默认值为 1）
   */
  constructor(r: number, g: number, b: number, opacity?: number) {
    // 校验 RGB 值范围，超出则自动限制在 0~255 之间
    this.r = isNaN(+r) ? 255 : Math.max(0, Math.min(255, +r));
    this.g = isNaN(+g) ? 255 : Math.max(0, Math.min(255, +g));
    this.b = isNaN(+b) ? 255 : Math.max(0, Math.min(255, +b));

    // 校验透明度范围，超出则限制在 0~1 之间，默认不透明（1）
    if (isValid(opacity)) {
      this.opacity = isNaN(+(opacity as number)) ? 1 : Math.max(0, Math.min(1, +(opacity as number)));
    } else {
      this.opacity = 1;
    }
  }

  /**
   * 将 RGB 转换为十六进制字符串
   * @returns 颜色字符串，例如 `#RRGGBB` 或 `#RRGGBBAA`
   *
   * 当 opacity === 1 时，仅返回 `#RRGGBB`；
   * 当 opacity < 1 时，附加透明度通道 `AA`。
   */
  formatHex() {
    return `#${hex(this.r) + hex(this.g) + hex(this.b) + (this.opacity === 1 ? '' : hex(this.opacity * 255))}`;
  }

  /**
   * 将 RGB 转换为 CSS RGB(A) 格式
   * @returns 颜色字符串，例如：
   *  - 不透明：`rgb(255,0,0)`
   *  - 半透明：`rgba(255,0,0,0.5)`
   */
  formatRgb() {
    const opacity = this.opacity;
    return `${opacity === 1 ? 'rgb(' : 'rgba('}${this.r},${this.g},${this.b}${opacity === 1 ? ')' : `,${opacity})`}`;
  }

  /**
   * 将 RGB 转换为 HSL(A) 格式
   * @returns 颜色字符串，例如：
   *  - 不透明：`hsl(0,100%,50%)`
   *  - 半透明：`hsla(0,100%,50%,0.5)`
   */
  formatHsl() {
    const opacity = this.opacity;
    const { h, s, l } = rgbToHsl(this.r, this.g, this.b);

    return `${opacity === 1 ? 'hsl(' : 'hsla('}${h},${s}%,${l}%${opacity === 1 ? ')' : `,${opacity})`}`;
  }

  /**
   * 默认转字符串方法（返回 HEX 格式）
   * @returns 十六进制颜色字符串，例如 `#ff0000` 或 `#ff000080`
   */
  toString() {
    return this.formatHex();
  }
}
