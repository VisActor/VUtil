import {
  SECOND,
  MINUTE,
  toDate,
  HOUR,
  DAY,
  MONTH,
  YEAR,
  fullYearSetterName,
  fullYearGetterName,
  monthSetterName,
  hoursSetterName,
  generateCeil,
  getIntervalOptions,
  generateStepInterval,
  bisect,
  tickStep
} from '@visactor/vutils';
import type { DateLikeType } from '../interface';

const timeIntervals: [string, number, number][] = [
  ['second', 1, SECOND],
  ['second', 5, SECOND * 5],
  ['second', 10, SECOND * 10],
  ['second', 30, SECOND * 30],
  ['minute', 1, MINUTE],
  ['minute', 5, MINUTE * 5],
  ['minute', 10, MINUTE * 10],
  ['minute', 30, MINUTE * 30],
  ['hour', 1, HOUR],
  ['hour', 3, HOUR * 3],
  ['hour', 6, HOUR * 6],
  ['hour', 12, HOUR * 12],
  ['day', 1, DAY],
  ['day', 2, DAY * 2],
  ['day', 7, DAY * 7],
  ['month', 1, MONTH],
  ['month', 3, MONTH * 3],
  ['month', 6, MONTH * 6],
  ['year', 1, DAY * 365] // 借鉴echarts，保证每个周期累加时不会碰到恰巧不够的问题
];

export function toDateNumber(t: DateLikeType) {
  return +toDate(t);
}

export function getTickInterval(min: Date, max: Date, tickCount: number, isUTC?: boolean) {
  const target = (+max - +min) / tickCount;
  const idx = bisect(
    timeIntervals.map(entry => entry[2]),
    target
  );

  if (idx === timeIntervals.length) {
    const step = Math.max(tickStep(+min / YEAR, +max / YEAR, tickCount), 1);
    const floor = (date: Date) => {
      (date as any)[fullYearSetterName(isUTC)](Math.floor((date as any)[fullYearGetterName(isUTC)]() / step) * step);
      (date as any)[monthSetterName(isUTC)](0, 1);
      (date as any)[hoursSetterName(isUTC)](0, 0, 0, 0);

      return date;
    };
    const offset = (date: Date, s: number) => {
      (date as any)[fullYearSetterName(isUTC)]((date as any)[fullYearGetterName(isUTC)]() + s * step);

      return date;
    };

    return {
      floor,
      offset,
      ceil: generateCeil(floor, offset)
    };
  }

  if (idx === 0) {
    const step = Math.max(tickStep(+min, +max, tickCount), 1);
    const floor = (date: Date) => {
      date.setTime(Math.floor(+date / step) * step);
      return date;
    };
    const offset = (date: Date, s: number) => {
      date.setTime(+date + s * step);

      return date;
    };

    return {
      floor,
      offset,
      ceil: generateCeil(floor, offset)
    };
  }

  const [timeUnit, step] =
    timeIntervals[target / timeIntervals[idx - 1][2] < timeIntervals[idx][2] / target ? idx - 1 : idx];
  const simpleIntervalOptions = getIntervalOptions(timeUnit, isUTC);

  return generateStepInterval(step, simpleIntervalOptions);
}
