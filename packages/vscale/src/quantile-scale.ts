import { isNil, isValidNumber, bisect, quantileSorted, ascending } from '@visactor/vutils';
import type { DiscretizingScaleType, IBaseScale } from './interface';
import { ScaleEnum } from './type';
import { equalArray } from './utils/array';

export class QuantileScale implements IBaseScale {
  readonly type: DiscretizingScaleType = ScaleEnum.Quantile;

  protected _range: any[] = [];
  protected _domain: number[] = [];
  protected _thresholds: number[] = [];

  protected _unknown: any;

  unknown(): any[];
  unknown(_: any): this;
  unknown(_?: any): this | any {
    if (!arguments.length) {
      return this._unknown;
    }
    this._unknown = _;
    return this;
  }

  rescale(slience?: boolean) {
    if (slience) {
      return this;
    }
    let i = 0;
    const n = Math.max(1, this._range.length);
    this._thresholds = new Array(n - 1);
    while (++i < n) {
      this._thresholds[i - 1] = quantileSorted(this._domain, i / n);
    }
    return this;
  }

  scale(x: any) {
    return isValidNumber(x) ? this._range[bisect(this._thresholds, x)] : this._unknown;
  }

  invertExtent(y: any) {
    const i = this._range.indexOf(y);
    return i < 0
      ? [NaN, NaN]
      : [
          i > 0 ? this._thresholds[i - 1] : this._domain[0],
          i < this._thresholds.length ? this._thresholds[i] : this._domain[this._domain.length - 1]
        ];
  }

  quantiles() {
    return this._thresholds.slice();
  }

  domain(): any[];
  domain(_: any[], slience?: boolean): this;
  domain(_?: any[], slience?: boolean): this | any {
    if (!_) {
      return this._domain.slice();
    }
    this._domain = [];
    for (const value of _) {
      if (!isNil(value) && !Number.isNaN(+value)) {
        this._domain.push(+value);
      }
    }

    this._domain.sort(ascending);
    return this.rescale(slience);
  }

  range(): any[];
  range(_: any[], slience?: boolean): this;
  range(_?: any[], slience?: boolean): this | any {
    if (!_) {
      return this._range.slice();
    }
    const nextRange = Array.from(_);
    if (equalArray(this._range, nextRange)) {
      return this;
    }
    this._range = nextRange;
    return this.rescale(slience);
  }

  clone(): QuantileScale {
    return new QuantileScale().domain(this._domain, true).range(this._range).unknown(this._unknown) as QuantileScale;
  }
}
