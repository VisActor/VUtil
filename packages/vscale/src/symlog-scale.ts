import type { ContinuousScaleType, NiceOptions, NiceType } from './interface';
import { LinearScale } from './linear-scale';
import { ScaleEnum } from './type';
import {
  d3TicksForLog,
  forceTicksBaseTransform,
  parseNiceOptions,
  tickIncrement,
  ticksBaseTransform
} from './utils/tick-sample';
import { symlog, symexp, nice } from './utils/utils';

export class SymlogScale extends LinearScale {
  readonly type: ContinuousScaleType = ScaleEnum.Symlog;

  _const: number;

  constructor() {
    super(symlog(1), symexp(1));
    this._const = 1;
  }

  clone(): SymlogScale {
    return new SymlogScale()
      .domain(this._domain, true)
      .range(this._range, true)
      .unknown(this._unknown)
      .clamp(this.clamp(), null, true)
      .interpolate(this._interpolate, true)
      .constant(this._const) as SymlogScale;
  }

  constant(): number;
  constant(_: number, slience?: boolean): this;
  constant(_?: number, slience?: boolean): this | number {
    if (!arguments.length) {
      return this._const;
    }

    this._const = _;
    this.transformer = symlog(_);
    this.untransformer = symexp(_);

    return this.rescale(slience);
  }

  d3TicksX = (start: number, stop: number, count: number, options?: { noDecimals?: boolean }) => {
    let reverse;
    let i = -1;
    let n;
    let ticks;
    let step;

    stop = +stop;
    start = +start;
    count = +count;

    // add check for start equal stop
    if (start === stop) {
      return [start];
    }

    if (Math.abs(start - stop) <= Number.MIN_VALUE && count > 0) {
      return [start];
    }
    if ((reverse = stop < start)) {
      n = start;
      start = stop;
      stop = n;
    }
    // step = 10000
    step = tickIncrement(start, stop, count).step;
    // why return empty array when stop === 0 ?
    // if (stop === 0 || !isFinite(step)) {
    if (!isFinite(step)) {
      return [];
    }

    if (step > 0) {
      let r0 = Math.round(start / step);
      let r1 = Math.round(stop / step);
      if (r0 * step < start) {
        ++r0;
      }
      if (r1 * step > stop) {
        --r1;
      }
      ticks = new Array((n = r1 - r0 + 1));
      while (++i < n) {
        ticks[i] = (r0 + i) * step;
      }
    } else if (step < 0 && options?.noDecimals) {
      step = 1;
      const r0 = Math.ceil(start);
      const r1 = Math.floor(stop);

      if (r0 <= r1) {
        ticks = new Array((n = r1 - r0 + 1));
        while (++i < n) {
          ticks[i] = r0 + i;
        }
      } else {
        return [];
      }
    } else {
      step = -step;
      let r0 = Math.round(start * step);
      let r1 = Math.round(stop * step);
      if (r0 / step < start) {
        ++r0;
      }
      if (r1 / step > stop) {
        --r1;
      }
      ticks = new Array((n = r1 - r0 + 1));
      while (++i < n) {
        ticks[i] = (r0 + i) / step;
      }
    }

    if (reverse) {
      ticks.reverse();
    }

    return ticks;
  };

  d3Ticks(count: number = 10, options?: { noDecimals?: boolean }) {
    const d = this.domain();
    const u = d[0];
    const v = d[d.length - 1];
    return d3TicksForLog(u, v, count, this._const, this.transformer, this.untransformer, options);
  }

  ticks(count: number = 10) {
    // return this.d3Ticks(count);
    const d = this.calculateVisibleDomain(this._range);
    return ticksBaseTransform(d[0], d[d.length - 1], count, this._const, this.transformer, this.untransformer);
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
    return forceTicksBaseTransform(d[0], d[d.length - 1], step, this.transformer, this.untransformer);
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
        floor: (x: number) => Math.floor(x),
        ceil: (x: number) => Math.ceil(x)
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
