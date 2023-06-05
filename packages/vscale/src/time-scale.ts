import { isNil, getTimeFormatter, getFormatFromValue, toDate, isNumber } from '@visactor/vutils';
import { ContinuousScale } from './continuous-scale';
import type { ContinuousScaleType, DateLikeType, FloorCeilType } from './interface';
import { ScaleEnum } from './type';
import { getTickInterval, toDateNumber } from './utils/time';
import { nice } from './utils/utils';

export class TimeScale extends ContinuousScale {
  readonly type: ContinuousScaleType = ScaleEnum.Time;

  _isUtc?: boolean;

  constructor(isUtc: boolean = false) {
    super();
    this._domain = isUtc
      ? [Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]
      : [+new Date(2000, 0, 1), +new Date(2000, 0, 2)];
    this._isUtc = isUtc;
  }

  invert(y: number) {
    return new Date(super.invert(y));
  }

  domain(): Date[];
  domain(_: DateLikeType[], slience?: boolean): this;
  domain(_?: DateLikeType[], slience?: boolean): Date[] | this {
    if (!_) {
      return this._domain.map(toDate);
    }

    const nextDomain = Array.from(_, toDateNumber) as [number, number];

    this._domain = nextDomain;
    return this.rescale(slience);
  }

  ticks(interval?: number | FloorCeilType<Date>) {
    const d = this.domain();
    let start = d[0];
    let stop = d[d.length - 1];

    const reverse = stop < start;
    if (reverse) {
      [start, stop] = [stop, start];
    }

    let options = interval as FloorCeilType<Date>;

    if (isNumber(interval) || isNil(interval)) {
      options = getTickInterval(start, stop, isNil(interval) ? 10 : (interval as number), this._isUtc);
    }

    start = options.ceil(start as Date);

    const tickValues = [];
    let cur = +start;
    let i = 0;
    const maxCount = 100;

    while (cur <= +stop && i < maxCount) {
      tickValues.push(new Date(cur));
      cur = +options.offset(new Date(cur), 1);
      i++;
    }
    return reverse ? tickValues.reverse() : tickValues;
  }

  tickFormat(count?: number, specifier?: string) {
    return specifier == null
      ? getTimeFormatter(getFormatFromValue(this._domain[0], this._isUtc), this._isUtc)
      : getTimeFormatter(specifier, this._isUtc);
  }

  clone(): TimeScale {
    return new TimeScale(this._isUtc)
      .domain(this.domain(), true)
      .range(this._range, true)
      .unknown(this._unknown)
      .clamp(this.clamp(), null, true)
      .interpolate(this._interpolate);
  }

  nice(interval?: number | FloorCeilType<Date>) {
    const d = this.domain();
    let options = interval as FloorCeilType<Date>;

    if (isNumber(interval) || isNil(interval)) {
      options = getTickInterval(d[0], d[d.length - 1], isNil(interval) ? 10 : (interval as number), this._isUtc);
    }

    if (options) {
      this.domain(nice(d, options));
    }

    return this;
  }

  utc() {
    return this._isUtc;
  }
}
