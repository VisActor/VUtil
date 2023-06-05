import { isNil, isValidNumber, bisect } from '@visactor/vutils';
import type { DiscretizingScaleType, IBaseScale } from './interface';
import { ScaleEnum } from './type';

export class ThresholdScale implements IBaseScale {
  readonly type: DiscretizingScaleType = ScaleEnum.Threshold;

  protected _range: any[] = [0, 1];
  protected _domain: number[] = [0.5];
  protected n: number = 1;

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

  scale(x: any) {
    return !isNil(x) && isValidNumber(+x) ? this._range[bisect(this._domain, x, 0, this.n)] : this._unknown;
  }

  invertExtent(y: any) {
    const i = this._range.indexOf(y);
    return [this._domain[i - 1], this._domain[i]];
  }

  domain(): any[];
  domain(_: any[]): this;
  domain(_?: any[]): this | any {
    if (!_) {
      return this._domain.slice();
    }
    this._domain = Array.from(_);
    this.n = Math.min(this._domain.length, this._range.length - 1);
    return this;
  }

  range(): any[];
  range(_: any[]): this;
  range(_?: any[]): this | any {
    if (!_) {
      return this._range.slice();
    }
    this._range = Array.from(_);
    this.n = Math.min(this._domain.length, this._range.length - 1);

    return this;
  }

  clone(): ThresholdScale {
    return new ThresholdScale().domain(this._domain).range(this._range).unknown(this._unknown);
  }
}
