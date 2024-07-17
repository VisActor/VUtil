import { mixin } from '@visactor/vutils';
import type { ContinuousScaleType, NiceOptions, NiceType } from './interface';
import { LinearScale } from './linear-scale';
import { ScaleEnum } from './type';
import { d3TicksForLog, forceTicksBaseTransform, parseNiceOptions, ticksBaseTransform } from './utils/tick-sample';
import { symlog, symexp, nice } from './utils/utils';
import { LogNiceMixin } from './log-nice-mixin';

export interface SymlogScale extends LinearScale {
  nice: (count?: number, option?: NiceOptions) => this;
  niceMin: (count?: number) => this;
  niceMax: (count?: number) => this;
}

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
}

mixin(SymlogScale, LogNiceMixin);
