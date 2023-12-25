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
import { clamp, isNil } from '../common';
import { RGB } from './rgb';
import { DEFAULT_COLORS } from './defaultColors';
import hslToRgb from './hslToRgb';
import { rgb } from './numberToRgb';
import { REG_HEX, parseColorString } from './parseColorString';
import rgbToHsl from './rgbToHsl';

function SRGBToLinear(c: number) {
  return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

function LinearToSRGB(c: number) {
  return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
}

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

  static getColorBrightness(source: string | Color, model: 'hsv' | 'hsl' | 'lum' | 'lum2' | 'lum3' = 'hsl') {
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
      default:
        return color.getHSVBrightness();
    }
  }

  constructor(value: string) {
    const color = parseColorString(value);

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
    const isHex = REG_HEX.exec(formatValue);

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
    return this;
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
