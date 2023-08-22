import { cloneDeep } from '@visactor/vutils';
import type { ContinuousScaleType } from './interface';
import { LinearScale } from './linear-scale';
import { ScaleEnum } from './type';
import { forceTicksBaseTransform, stepTicks, ticksBaseTransform } from './utils/tick-sample';
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

  nice(): this {
    const niceDomain = cloneDeep(this._domain);
    this._niceDomain = nice(niceDomain, {
      floor: (x: number) => this.untransformer(Math.floor(this.transformer(x))),
      ceil: (x: number) => this.untransformer(Math.ceil(this.transformer(x)))
    }) as number[];
    this.rescale();
    return this;
  }

  /**
   * 只对min区间进行nice
   * 如果保持某一边界的值，就很难有好的nice效果，所以这里实现就是nice之后还原固定的边界值
   */
  niceMin(): this {
    const maxD = this._domain[this._domain.length - 1];
    this.nice();
    const niceDomain = cloneDeep(this._domain);

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
    const niceDomain = cloneDeep(this._domain);

    if (this._domain) {
      niceDomain[0] = minD;
      this._niceDomain = niceDomain;
      this.rescale();
    }

    return this;
  }
}
