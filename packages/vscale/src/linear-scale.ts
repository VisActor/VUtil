import { ScaleEnum } from './type';
import { d3Ticks, forceTicks, niceLinear, stepTicks, ticks } from './utils/tick-sample';
import { ContinuousScale } from './continuous-scale';
import type { ContinuousScaleType } from './interface';

/**
 * TODO:
 * 1. niceMax/niceMin
 * 2. tickFormat
 */
export class LinearScale extends ContinuousScale {
  readonly type: ContinuousScaleType = ScaleEnum.Linear;
  protected _needNiceMin?: boolean;
  protected _needNiceMax?: boolean;
  protected _needNice?: boolean;

  clone(): LinearScale {
    return new LinearScale()
      .domain(this._domain, true)
      .range(this._range, true)
      .unknown(this._unknown)
      .clamp(this.clamp(), null, true)
      .interpolate(this._interpolate) as LinearScale;
  }

  tickFormat() {
    // TODO
    return () => {
      // TODO
    };
  }

  d3Ticks(count: number = 10) {
    const d = this.calculateVisibleDomain(this._range);
    return d3Ticks(d[0], d[d.length - 1], count);
  }

  /**
   * the kind of algorithms will generate ticks that is smaller than the min or greater than the max
   * if we don't update niceDomain, the ticks will exceed the domain
   */
  ticks(count: number = 10) {
    if (this._rangeFactor && (this._rangeFactor[0] > 0 || this._rangeFactor[1] < 1) && this._range.length === 2) {
      return this.d3Ticks(count);
    }
    const domain = this._domain;
    const start = domain[0];
    const stop = domain[domain.length - 1];
    const ticksResult = ticks(start, stop, count);

    if (
      ticksResult.length &&
      ((ticksResult[0] !== start && (this._needNice || this._needNiceMin)) ||
        (ticksResult[ticksResult.length - 1] !== stop && (this._needNice || this._needNiceMax)))
    ) {
      const newNiceDomain = domain.slice();

      if (this._needNice || this._needNiceMin) {
        newNiceDomain[0] = ticksResult[0];
      }

      if (this._needNice || this._needNiceMax) {
        newNiceDomain[newNiceDomain.length - 1] = ticksResult[ticksResult.length - 1];
      }

      this._niceDomain = newNiceDomain;
      this.rescale();
    }

    return ticksResult;
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

  nice(count: number = 10): this {
    this._needNice = true;
    const niceDomain = niceLinear(this.domain(), count);

    if (niceDomain) {
      this._niceDomain = niceDomain;

      this.rescale();
    }
    return this;
  }

  /**
   * 只对min区间进行nice
   * 如果保持某一边界的值，就很难有好的nice效果，所以这里实现就是nice之后还原固定的边界值
   * @param count
   */
  niceMin(count: number = 10): this {
    this._needNiceMin = true;
    const maxD = this._domain[this._domain.length - 1];
    const niceDomain = niceLinear(this.domain(), count);

    if (niceDomain) {
      niceDomain[niceDomain.length - 1] = maxD;

      this._niceDomain = niceDomain;

      this.rescale();
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
    this._needNiceMax = true;
    const minD = this._domain[0];
    const niceDomain = niceLinear(this.domain(), count);

    if (niceDomain) {
      niceDomain[0] = minD;
      this._niceDomain = niceDomain;

      this.rescale();
    }

    return this;
  }
}
