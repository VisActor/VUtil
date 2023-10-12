import { clamp, isNil } from '@visactor/vutils';
import type { IRangeFactor, ScaleFishEyeOptions } from './interface';

export abstract class BaseScale implements IRangeFactor {
  protected _wholeRange: any[];
  protected _rangeFactor?: number[];
  protected _unknown: any;
  protected _fishEyeOptions?: ScaleFishEyeOptions;
  protected _fishEyeTransform?: (output: number) => number;

  abstract range(): any[];
  abstract domain(): any[];
  abstract invert(d: any): any;

  protected _calculateWholeRange(range: any[]) {
    if (this._wholeRange) {
      return this._wholeRange;
    }

    if (this._rangeFactor && range.length === 2) {
      const k = (range[1] - range[0]) / (this._rangeFactor[1] - this._rangeFactor[0]);
      const b = range[0] - k * this._rangeFactor[0];
      const r0 = b;
      const r1 = k + b;
      this._wholeRange = [r0, r1];

      return this._wholeRange;
    }
    return range;
  }

  abstract calculateVisibleDomain(range: any[]): any[];

  rangeFactor(): [number, number];
  rangeFactor(_: [number, number], slience?: boolean, clear?: boolean): this;
  rangeFactor(_?: [number, number], slience?: boolean, clear?: boolean): this | any[] {
    if (!_) {
      if (clear) {
        this._wholeRange = null;
        this._rangeFactor = null;
        return this;
      }

      return this._rangeFactor;
    }
    if (_.length === 2 && _.every(r => r >= 0 && r <= 1)) {
      this._wholeRange = null;
      this._rangeFactor = _[0] === 0 && _[1] === 1 ? null : _;
    }

    return this;
  }

  protected generateFishEyeTransform() {
    if (!this._fishEyeOptions) {
      this._fishEyeTransform = null;

      return;
    }
    const { distortion = 2, radiusRatio = 0.1, radius } = this._fishEyeOptions;
    const range = this.range();
    const first = range[0];
    const last = range[range.length - 1];
    const min = Math.min(first, last);
    const max = Math.max(first, last);
    const focus = clamp(this._fishEyeOptions.focus ?? 0, min, max);
    const rangeRadius = isNil(radius) ? (max - min) * radiusRatio : radius;
    let k0 = Math.exp(distortion);
    k0 = (k0 / (k0 - 1)) * rangeRadius;
    const k1 = distortion / rangeRadius;

    this._fishEyeTransform = (output: number) => {
      const delta = Math.abs(output - focus);

      if (delta >= rangeRadius) {
        return output;
      }

      if (delta <= 1e-6) {
        return focus;
      }
      const k = ((k0 * (1 - Math.exp(-delta * k1))) / delta) * 0.75 + 0.25;

      return focus + (output - focus) * k;
    };
  }

  unknown(): any[];
  unknown(_: any): this;
  unknown(_?: any): this | any {
    if (!arguments.length) {
      return this._unknown;
    }
    this._unknown = _;
    return this;
  }
}
