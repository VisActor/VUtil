import { isValidNumber, bisect, arrayEqual } from '@visactor/vutils';
import { ScaleEnum } from './type';
import { forceTicks, niceLinear, stepTicks, ticks } from './utils/tick-sample';
import type { DiscretizingScaleType, IBaseScale } from './interface';

export class QuantizeScale implements IBaseScale {
  readonly type: DiscretizingScaleType = ScaleEnum.Quantile;

  protected _range: any[] = [0, 1];
  protected _domain: number[] = [0.5];
  protected x0: number = 0;
  protected x1: number = 1;
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

  rescale(slience?: boolean) {
    if (slience) {
      return this;
    }
    let i = -1;
    this._domain = new Array(this.n);

    while (++i < this.n) {
      this._domain[i] = ((i + 1) * this.x1 - (i - this.n) * this.x0) / (this.n + 1);
    }
    return this;
  }

  scale(x: any) {
    return isValidNumber(x) ? this._range[bisect(this._domain, x, 0, this.n)] : this._unknown;
  }

  invertExtent(y: any) {
    const i = this._range.indexOf(y);
    return i < 0
      ? [NaN, NaN]
      : i < 1
      ? [this.x0, this._domain[0]]
      : i >= this.n
      ? [this._domain[this.n - 1], this.x1]
      : [this._domain[i - 1], this._domain[i]];
  }

  thresholds() {
    return this._domain.slice();
  }

  domain(): any[];
  domain(_: any[], slience?: boolean): this;
  domain(_?: any[], slience?: boolean): this | any {
    if (!_) {
      return [this.x0, this.x1];
    }
    const domain = Array.from(_);
    this.x0 = +domain[0];
    this.x1 = +domain[1];

    return this.rescale(slience);
  }

  range(): any[];
  range(_: any[], slience?: boolean): this;
  range(_?: any[], slience?: boolean): this | any {
    if (!_) {
      return this._range.slice();
    }
    const nextRange = Array.from(_);
    if (arrayEqual(this._range, nextRange)) {
      return this;
    }
    this.n = nextRange.length - 1;
    this._range = nextRange;
    return this.rescale(slience);
  }

  clone(): QuantizeScale {
    return new QuantizeScale()
      .domain([this.x0, this.x1], true)
      .range(this._range)
      .unknown(this._unknown) as QuantizeScale;
  }

  ticks(count: number = 10) {
    const d = this.domain();

    return ticks(d[0], d[d.length - 1], count);
  }

  /**
   * 生成tick数组，这个tick数组的长度就是count的长度
   * @param count
   */
  forceTicks(count: number = 10): any[] {
    const d = this.domain();
    return forceTicks(d[0], d[d.length - 1], count);
  }

  /**
   * 基于给定step的ticks数组生成
   * @param step
   */
  stepTicks(step: number): any[] {
    const d = this.domain();

    return stepTicks(d[0], d[d.length - 1], step);
  }

  nice(count: number = 10): this {
    const niceDomain = niceLinear(this.domain(), count);

    if (niceDomain) {
      return this.domain(niceDomain);
    }

    return this;
  }

  /**
   * 只对min区间进行nice
   * 如果保持某一边界的值，就很难有好的nice效果，所以这里实现就是nice之后还原固定的边界值
   * @param count
   */
  niceMin(count: number = 10): this {
    const maxD = this._domain[this._domain.length - 1];
    const niceDomain = niceLinear(this.domain(), count);

    if (niceDomain) {
      niceDomain[niceDomain.length - 1] = maxD;
      this.domain(niceDomain);
    }

    return this;
  }

  /**
   * 只对max区间进行nice
   * 如果保持某一边界的值，就很难有好的nice效果，所以这里实现就是nice之后还原固定的边界值
   * @param count
   * @returns
   */
  niceMax(count: number = 10): this {
    const minD = this._domain[0];
    const niceDomain = niceLinear(this.domain(), count);

    if (niceDomain) {
      niceDomain[0] = minD;
      this.domain(niceDomain);
    }

    return this;
  }
}
