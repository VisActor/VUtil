import { isValid } from '../common';
import { hex } from './numberToHex';
import rgbToHsl from './rgbToHsl';

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
