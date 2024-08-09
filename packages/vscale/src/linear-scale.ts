import { ScaleEnum } from './type';
import { d3Ticks, forceTicks, niceLinear, parseNiceOptions, stepTicks, ticks } from './utils/tick-sample';
import { ContinuousScale } from './continuous-scale';
import type { ContinuousScaleType, NiceOptions } from './interface';
import { isValid } from '@visactor/vutils';
import { wilkinsonExtended } from './utils/tick-wilkinson-extended';

/**
 * TODO:
 * 1. niceMax/niceMin
 * 2. tickFormat
 */
export class LinearScale extends ContinuousScale {
  readonly type: ContinuousScaleType = ScaleEnum.Linear;

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

  d3Ticks(count: number = 10, options?: { noDecimals?: boolean }) {
    const d = this.calculateVisibleDomain(this._range);
    return d3Ticks(d[0], d[d.length - 1], count, options);
  }

  wilkinsonTicks(count: number = 5) {
    const d = this.calculateVisibleDomain(this._range);
    return wilkinsonExtended(d[0], d[1], count);
  }

  /**
   * the kind of algorithms will generate ticks that is smaller than the min or greater than the max
   * if we don't update niceDomain, the ticks will exceed the domain
   */
  ticks(count: number = 10, options?: { noDecimals?: boolean }) {
    if (
      (isValid(this._rangeFactorStart) &&
        isValid(this._rangeFactorEnd) &&
        (this._rangeFactorStart > 0 || this._rangeFactorEnd < 1) &&
        this._range.length === 2) ||
      !this._niceType
    ) {
      return this.d3Ticks(count, options);
    }
    const curNiceDomain = this._niceDomain ?? this._domain;
    const originalDomain = this._domain;
    const start = curNiceDomain[0];
    const stop = curNiceDomain[curNiceDomain.length - 1];
    let ticksResult = ticks(originalDomain[0], originalDomain[originalDomain.length - 1], count, options);

    if (!ticksResult.length) {
      return ticksResult;
    }

    if (this._domainValidator) {
      ticksResult = ticksResult.filter(this._domainValidator);
    } else if ((ticksResult[0] !== start || ticksResult[ticksResult.length - 1] !== stop) && this._niceType) {
      const newNiceDomain = curNiceDomain.slice();

      if (this._niceType === 'all') {
        newNiceDomain[0] = ticksResult[0];
        newNiceDomain[newNiceDomain.length - 1] = ticksResult[ticksResult.length - 1];
        this._niceDomain = newNiceDomain;
        this.rescale();
      } else if (this._niceType === 'min' && ticksResult[0] !== start) {
        newNiceDomain[0] = ticksResult[0];
        this._niceDomain = newNiceDomain;
        this.rescale();
      } else if (this._niceType === 'max' && ticksResult[ticksResult.length - 1] !== stop) {
        newNiceDomain[newNiceDomain.length - 1] = ticksResult[ticksResult.length - 1];
        this._niceDomain = newNiceDomain;
        this.rescale();
      }

      if (this._niceType !== 'all') {
        const min = Math.min(newNiceDomain[0], newNiceDomain[newNiceDomain.length - 1]);
        const max = Math.max(newNiceDomain[0], newNiceDomain[newNiceDomain.length - 1]);

        ticksResult = ticksResult.filter((entry: number) => entry >= min && entry <= max);
      }
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

  nice(count: number = 10, option?: NiceOptions): this {
    const originalDomain = this._domain;
    let niceMinMax: number[] = [];

    if (option) {
      const res = parseNiceOptions(originalDomain, option);
      niceMinMax = res.niceMinMax;
      this._domainValidator = res.domainValidator;
      this._niceType = res.niceType;

      if (res.niceDomain) {
        this._niceDomain = res.niceDomain;
        this.rescale();

        return this;
      }
    } else {
      this._niceType = 'all';
    }

    if (this._niceType) {
      const niceDomain = niceLinear(originalDomain.slice(), count);

      if (this._niceType === 'min') {
        niceDomain[niceDomain.length - 1] = niceMinMax[1] ?? niceDomain[niceDomain.length - 1];
      } else if (this._niceType === 'max') {
        niceDomain[0] = niceMinMax[0] ?? niceDomain[0];
      }

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
    this._niceType = 'min';

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
    this._niceType = 'max';
    const minD = this._domain[0];
    const niceDomain = niceLinear(this._domain.slice(), count);

    if (niceDomain) {
      niceDomain[0] = minD;
      this._niceDomain = niceDomain;

      this.rescale();
    }

    return this;
  }
}
