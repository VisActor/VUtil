import { clamp, isNil, isValid } from '@visactor/vutils';
import type { IRangeFactor, ScaleFishEyeOptions } from './interface';
import { calculateWholeRangeFromRangeFactor } from './utils/utils';

export abstract class BaseScale implements IRangeFactor {
  protected _wholeRange: any[];
  protected _rangeFactorStart?: number = null;
  protected _rangeFactorEnd?: number = null;
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

    if (isValid(this._rangeFactorStart) && isValid(this._rangeFactorEnd) && range.length === 2) {
      this._wholeRange = calculateWholeRangeFromRangeFactor(range, [this._rangeFactorStart, this._rangeFactorEnd]);
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
        this._rangeFactorStart = null;
        this._rangeFactorEnd = null;
        return this;
      }

      if (isValid(this._rangeFactorStart) && isValid(this._rangeFactorEnd)) {
        return [this._rangeFactorStart, this._rangeFactorEnd];
      }
      return null;
    }
    if (_.length === 2 && _.every(r => r >= 0 && r <= 1)) {
      this._wholeRange = null;
      if (_[0] === 0 && _[1] === 1) {
        this._rangeFactorStart = null;
        this._rangeFactorEnd = null;
      } else {
        this._rangeFactorStart = _[0];
        this._rangeFactorEnd = _[1];
      }
    }

    return this;
  }

  rangeFactorStart(): number;
  rangeFactorStart(_: number, slience?: boolean): this;
  rangeFactorStart(_?: number, slience?: boolean): this | any {
    if (isNil(_)) {
      return this._rangeFactorStart;
    }
    if (_ >= 0 && _ <= 1) {
      this._wholeRange = null;
      if (_ === 0 && (isNil(this._rangeFactorEnd) || this._rangeFactorEnd === 1)) {
        this._rangeFactorStart = null;
        this._rangeFactorEnd = null;
      } else {
        this._rangeFactorStart = _;
        this._rangeFactorEnd = this._rangeFactorEnd ?? 1;
      }
    }

    return this;
  }

  rangeFactorEnd(): number;
  rangeFactorEnd(_: number, slience?: boolean): this;
  rangeFactorEnd(_?: number, slience?: boolean): this | any {
    if (isNil(_)) {
      return this._rangeFactorEnd;
    }
    if (_ >= 0 && _ <= 1) {
      this._wholeRange = null;
      if (_ === 0 && (isNil(this._rangeFactorStart) || this._rangeFactorStart === 0)) {
        this._rangeFactorStart = null;
        this._rangeFactorEnd = null;
      } else {
        this._rangeFactorEnd = _;
        this._rangeFactorStart = this._rangeFactorStart ?? 0;
      }
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
