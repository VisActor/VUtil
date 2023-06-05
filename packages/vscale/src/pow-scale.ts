import type { ContinuousScaleType } from './interface';
import { LinearScale } from './linear-scale';
import { ScaleEnum } from './type';
import { identity, sqrt, square, generatePow } from './utils/utils';

export class PowScale extends LinearScale {
  readonly type: ContinuousScaleType = ScaleEnum.Pow;

  _exponent: number;

  constructor() {
    super();
    this._exponent = 1;
  }

  clone(): PowScale {
    return new PowScale()
      .domain(this._domain, true)
      .range(this._range, true)
      .unknown(this._unknown)
      .clamp(this.clamp(), null, true)
      .interpolate(this._interpolate, true)
      .exponent(this._exponent) as PowScale;
  }

  rescale(slience?: boolean) {
    if (slience) {
      return this;
    }
    if (this._exponent === 1) {
      this.transformer = identity;
      this.untransformer = identity;
    } else if (this._exponent === 0.5) {
      this.transformer = sqrt;
      this.untransformer = square;
    } else {
      this.transformer = generatePow(this._exponent);
      this.untransformer = generatePow(1 / this._exponent);
    }

    super.rescale();
    return this;
  }

  exponent(): number;
  exponent(_: number, slience?: boolean): this;
  exponent(_?: number, slience?: boolean): this | number {
    if (!arguments.length) {
      return this._exponent;
    }

    this._exponent = _;

    return this.rescale(slience);
  }
}
