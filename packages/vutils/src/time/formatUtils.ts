import pad from '../common/pad';
import type { DateLikeType } from '../common/toDate';
import { toDate } from '../common/toDate';

export function fullYearGetterName(isUTC?: boolean) {
  return isUTC ? 'getUTCFullYear' : 'getFullYear';
}

export function monthGetterName(isUTC?: boolean) {
  return isUTC ? 'getUTCMonth' : 'getMonth';
}

export function dateGetterName(isUTC?: boolean) {
  return isUTC ? 'getUTCDate' : 'getDate';
}

export function hoursGetterName(isUTC?: boolean) {
  return isUTC ? 'getUTCHours' : 'getHours';
}

export function minutesGetterName(isUTC?: boolean) {
  return isUTC ? 'getUTCMinutes' : 'getMinutes';
}

export function secondsGetterName(isUTC?: boolean) {
  return isUTC ? 'getUTCSeconds' : 'getSeconds';
}

export function millisecondsGetterName(isUTC?: boolean) {
  return isUTC ? 'getUTCMilliseconds' : 'getMilliseconds';
}

export function fullYearSetterName(isUTC?: boolean) {
  return isUTC ? 'setUTCFullYear' : 'setFullYear';
}

export function monthSetterName(isUTC?: boolean) {
  return isUTC ? 'setUTCMonth' : 'setMonth';
}

export function dateSetterName(isUTC?: boolean) {
  return isUTC ? 'setUTCDate' : 'setDate';
}

export function hoursSetterName(isUTC?: boolean) {
  return isUTC ? 'setUTCHours' : 'setHours';
}

export function minutesSetterName(isUTC?: boolean) {
  return isUTC ? 'setUTCMinutes' : 'setMinutes';
}

export function secondsSetterName(isUTC?: boolean) {
  return isUTC ? 'setUTCSeconds' : 'setSeconds';
}

export function millisecondsSetterName(isUTC?: boolean) {
  return isUTC ? 'setUTCMilliseconds' : 'setMilliseconds';
}

/**
 * 根据时间推断格式化字符串
 * @param value
 * @param isUTC
 * @returns
 */
export function getFormatFromValue(value: DateLikeType, isUTC?: boolean) {
  const date = toDate(value);
  const M = (date as any)[monthGetterName(isUTC)]() + 1;
  const d = (date as any)[dateGetterName(isUTC)]();
  const h = (date as any)[hoursGetterName(isUTC)]();
  const m = (date as any)[minutesGetterName(isUTC)]();
  const s = (date as any)[secondsGetterName(isUTC)]();
  const S = (date as any)[millisecondsGetterName(isUTC)]();

  const isSecond = S === 0;
  const isMinute = isSecond && s === 0;
  const isHour = isMinute && m === 0;
  const isDay = isHour && h === 0;
  const isMonth = isDay && d === 1;
  const isYear = isMonth && M === 1;

  if (isYear) {
    return 'YYYY';
  } else if (isMonth) {
    return 'YYYY-MM';
  } else if (isDay) {
    return 'YYYY-MM-DD';
  } else if (isHour) {
    return 'HH';
  } else if (isMinute) {
    return 'HH:mm';
  } else if (isSecond) {
    return 'HH:mm:ss';
  }
  return 'HH:mm:ss SSS';
}

export function getTimeFormatter(template: string, isUTC?: boolean) {
  return (time: DateLikeType) => {
    const date = toDate(time);
    const y = date[fullYearGetterName(isUTC)]();
    const M = date[monthGetterName(isUTC)]() + 1;
    const q = Math.floor((M - 1) / 3) + 1;
    const d = date[dateGetterName(isUTC)]();
    const e = date[('get' + (isUTC ? 'UTC' : '') + 'Day') as 'getDay' | 'getUTCDay']();
    const H = date[hoursGetterName(isUTC)]();
    const h = ((H - 1) % 12) + 1;
    const m = date[minutesGetterName(isUTC)]();
    const s = date[secondsGetterName(isUTC)]();
    const S = date[millisecondsGetterName(isUTC)]();

    // 月份，周等需要管理管理locale的时间格式化暂时不支持
    return (
      (template || '')
        .replace(/YYYY/g, pad(y + '', 4, '0', 'left'))
        .replace(/yyyy/g, y + '')
        .replace(/yy/g, (y % 100) + '')
        .replace(/Q/g, q + '')
        // .replace(/{MMMM}/g, month[M - 1])
        // .replace(/{MMM}/g, monthAbbr[M - 1])
        .replace(/MM/g, pad(M, 2, '0', 'left'))
        .replace(/M/g, M + '')
        .replace(/dd/g, pad(d, 2, '0', 'left'))
        .replace(/d/g, d + '')
        // .replace(/{eeee}/g, dayOfWeek[e])
        // .replace(/{ee}/g, dayOfWeekAbbr[e])
        .replace(/e/g, e + '')
        .replace(/HH/g, pad(H, 2, '0', 'left'))
        .replace(/H/g, H + '')
        .replace(/hh/g, pad(h + '', 2, '0', 'left'))
        .replace(/h/g, h + '')
        .replace(/mm/g, pad(m, 2, '0', 'left'))
        .replace(/m/g, m + '')
        .replace(/ss/g, pad(s, 2, '0', 'left'))
        .replace(/s/g, s + '')
        .replace(/SSS/g, pad(S, 3, '0', 'left'))
        .replace(/S/g, S + '')
    );
  };
}
