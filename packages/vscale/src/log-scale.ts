import { ticks, forceTicks, stepTicks } from './utils/tick-sample';
import { ContinuousScale } from './continuous-scale';
import { ScaleEnum } from './type';
import { logp, nice, powp, logNegative, expNegative, identity } from './utils/utils';
import type { ContinuousScaleType } from './interface';

/**
 * 逆反函数
 * @param f
 * @returns
 */
function reflect(f: (x: number) => number) {
  return (x: number) => -f(-x);
}

export class LogScale extends ContinuousScale {
  readonly type: ContinuousScaleType = ScaleEnum.Log;

  _base: number;
  _logs: (x: number) => number;
  _pows: (x: number) => number;

  constructor() {
    super(logp(10), powp(10));

    this._logs = this.transformer;
    this._pows = this.untransformer;
    this._domain = [1, 10];
    this._base = 10;
  }

  clone(): LogScale {
    return new LogScale()
      .domain(this._domain, true)
      .range(this._range, true)
      .unknown(this._unknown)
      .clamp(this.clamp(), null, true)
      .interpolate(this._interpolate, true)
      .base(this._base) as LogScale;
  }

  rescale(slience?: boolean) {
    if (slience) {
      return this;
    }
    super.rescale();

    const logs = logp(this._base);
    const pows = powp(this._base);

    if (this._domain[0] < 0) {
      this._logs = reflect(logs);
      this._pows = reflect(pows);

      this.transformer = logNegative;
      this.untransformer = expNegative;
    } else {
      this._logs = logs;
      this._pows = pows;

      this.transformer = logs;
      this.untransformer = pows;
    }

    return this;
  }

  base(): number;
  base(_: number, slience?: boolean): this;
  base(_?: number, slience?: boolean): this | number {
    if (!arguments.length) {
      return this._base;
    }

    this._base = _;
    return this.rescale(slience);
  }

  tickFormat() {
    // TODO
    return identity;
  }

  ticks(count: number = 10) {
    const d = this.domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;

    if (r) {
      [u, v] = [v, u];
    }

    let i = this._logs(u);
    let j = this._logs(v);
    let k;
    let t;
    let z = [];

    if (!(this._base % 1) && j - i < count) {
      (i = Math.floor(i)), (j = Math.ceil(j));
      if (u > 0) {
        for (; i <= j; ++i) {
          for (k = 1; k < this._base; ++k) {
            t = i < 0 ? k / this._pows(-i) : k * this._pows(i);
            if (t < u) {
              continue;
            }
            if (t > v) {
              break;
            }
            z.push(t);
          }
        }
      } else {
        for (; i <= j; ++i) {
          for (k = this._base - 1; k >= 1; --k) {
            t = i > 0 ? k / this._pows(-i) : k * this._pows(i);
            if (t < u) {
              continue;
            }
            if (t > v) {
              break;
            }
            z.push(t);
          }
        }
      }
      if (z.length * 2 < count) {
        z = ticks(u, v, count);
      }
    } else {
      z = ticks(i, j, Math.min(j - i, count)).map(this._pows);
    }
    return r ? z.reverse() : z;
  }

  /**
   * 生成tick数组，这个tick数组的长度就是count的长度
   * @param count
   */
  forceTicks(count: number = 10): any[] {
    const d = this.calculateVisibleDomain(this._range);
    return forceTicks(d[0], d[d.length - 1], count);
  }

  /**
   * 基于给定step的ticks数组生成
   * @param step
   */
  stepTicks(step: number): any[] {
    const d = this.calculateVisibleDomain(this._range);
    return stepTicks(d[0], d[d.length - 1], step);
  }

  nice(): this {
    return this.domain(
      nice(this.domain(), {
        floor: (x: number) => this._pows(Math.floor(this._logs(x))),
        ceil: (x: number) => this._pows(Math.ceil(this._logs(x)))
      })
    );
  }
}
