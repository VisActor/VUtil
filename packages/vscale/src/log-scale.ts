import { ticks, ticksBaseTransform, forceTicksBaseTransform, parseNiceOptions } from './utils/tick-sample';
import { ContinuousScale } from './continuous-scale';
import { ScaleEnum } from './type';
import { logp, nice, powp, logNegative, expNegative, identity } from './utils/utils';
import type { ContinuousScaleType, NiceOptions, NiceType, PolymapType } from './interface';

/**
 * 逆反函数
 * @param f
 * @returns
 */
function reflect(f: (x: number) => number) {
  return (x: number) => -f(-x);
}

function limitPositiveZero(min: number = Number.EPSILON) {
  return (x: number) => {
    return Math.max(x, min);
  };
}

function limitNegativeZero(min: number = Number.EPSILON) {
  return (x: number) => {
    return Math.min(x, -min);
  };
}

export class LogScale extends ContinuousScale {
  readonly type: ContinuousScaleType = ScaleEnum.Log;

  _base: number;
  _logs: (x: number) => number;
  _pows: (x: number) => number;
  _limit: (x: number) => number;

  constructor() {
    super(logp(10), powp(10));

    this._limit = limitPositiveZero();
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

    const domain = this._niceDomain ?? this._domain;

    if (domain[0] < 0) {
      this._logs = reflect(logs);
      this._pows = reflect(pows);
      this._limit = limitNegativeZero();

      this.transformer = logNegative;
      this.untransformer = expNegative;
    } else {
      this._logs = logs;
      this._pows = pows;
      this._limit = limitPositiveZero();

      this.transformer = this._logs;
      this.untransformer = pows;
    }

    return this;
  }

  scale(x: any): any {
    x = Number(x);
    if (Number.isNaN(x) || (this._domainValidator && !this._domainValidator(x))) {
      return this._unknown;
    }
    if (!this._output) {
      this._output = (this._piecewise as PolymapType<any>)(
        (this._niceDomain ?? this._domain).map(this._limit).map(this.transformer),
        this._calculateWholeRange(this._range),
        this._interpolate
      );
    }
    const output = this._output(this.transformer(this._limit(this._clamp(x))));

    return this._fishEyeTransform ? this._fishEyeTransform(output) : output;
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

  d3Ticks(count: number = 10) {
    const d = this.domain();
    let u = this._limit(d[0]);
    let v = this._limit(d[d.length - 1]);
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
      // this._base is integer
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
    z = z.filter((t: number) => t !== 0);
    return r ? z.reverse() : z;
  }

  ticks(count: number = 10) {
    // return this.d3Ticks(count);
    const d = this.calculateVisibleDomain(this._range);
    return ticksBaseTransform(
      this._limit(d[0]),
      this._limit(d[d.length - 1]),
      count,
      this._base,
      this.transformer,
      this.untransformer
    );
  }

  /**
   * 生成tick数组，这个tick数组的长度就是count的长度
   * @param count
   */
  forceTicks(count: number = 10): any[] {
    const d = this.calculateVisibleDomain(this._range);
    return forceTicksBaseTransform(d[0], d[d.length - 1], count, this.transformer, this.untransformer);
  }

  /**
   * 基于给定step的ticks数组生成
   * @param step
   */
  stepTicks(step: number): any[] {
    const d = this.calculateVisibleDomain(this._range);
    return forceTicksBaseTransform(
      this._limit(d[0]),
      this._limit(d[d.length - 1]),
      step,
      this.transformer,
      this.untransformer
    );
  }

  nice(count: number = 10, option?: NiceOptions): this {
    const originalDomain = this._domain;
    let niceMinMax: number[] = [];
    let niceType: NiceType = null;

    if (option) {
      const res = parseNiceOptions(originalDomain, option);
      niceMinMax = res.niceMinMax;
      this._domainValidator = res.domainValidator;

      niceType = res.niceType;

      if (res.niceDomain) {
        this._niceDomain = res.niceDomain;
        this.rescale();
        return this;
      }
    } else {
      niceType = 'all';
    }

    if (niceType) {
      const niceDomain = nice(originalDomain.slice(), {
        floor: (x: number) => this._pows(Math.floor(this._logs(this._limit(x)))),
        ceil: (x: number) => (Math.abs(x) >= 1 ? Math.ceil(x) : this._pows(Math.ceil(this._logs(this._limit(x)))))
      });

      if (niceType === 'min') {
        niceDomain[niceDomain.length - 1] = niceMinMax[1] ?? niceDomain[niceDomain.length - 1];
      } else if (niceType === 'max') {
        niceDomain[0] = niceMinMax[0] ?? niceDomain[0];
      }

      this._niceDomain = niceDomain as number[];
      this.rescale();
      return this;
    }

    return this;
  }

  /**
   * 只对min区间进行nice
   * 如果保持某一边界的值，就很难有好的nice效果，所以这里实现就是nice之后还原固定的边界值
   */
  niceMin(): this {
    const maxD = this._domain[this._domain.length - 1];
    this.nice();
    const niceDomain = this._domain.slice();

    if (this._domain) {
      niceDomain[niceDomain.length - 1] = maxD;
      this._niceDomain = niceDomain;
      this.rescale();
    }

    return this;
  }

  /**
   * 只对max区间进行nice
   * 如果保持某一边界的值，就很难有好的nice效果，所以这里实现就是nice之后还原固定的边界值
   */
  niceMax(): this {
    const minD = this._domain[0];
    this.nice();
    const niceDomain = this._domain.slice();

    if (this._domain) {
      niceDomain[0] = minD;
      this._niceDomain = niceDomain;
      this.rescale();
    }

    return this;
  }
}
