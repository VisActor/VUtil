import isNil from './isNil';
import isString from './isString';

export type DateLikeType = number | string | Date;

// eslint-disable-next-line no-useless-escape
const TIME_REG =
  /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/; // eslint-disable-line

export function toDate(val: DateLikeType): Date {
  if (val instanceof Date) {
    return val;
  } else if (isString(val)) {
    // Different browsers parse date in different way, so we parse it manually.
    // Some other issues:
    // new Date('1970-01-01') is UTC,
    // new Date('1970/01/01') and new Date('1970-1-01') is local.
    // See issue #3623
    const match = TIME_REG.exec(val);

    if (!match) {
      // return Invalid Date.
      return new Date(NaN);
    }

    // Use local time when no timezone offset specifed.
    if (!match[8]) {
      // match[n] can only be string or undefined.
      // But take care of '12' + 1 => '121'.
      return new Date(
        +match[1],
        +(match[2] || 1) - 1,
        +match[3] || 1,
        +match[4] || 0,
        +(match[5] || 0),
        +match[6] || 0,
        match[7] ? +match[7].substring(0, 3) : 0
      );
    }
    // Timezoneoffset of Javascript Date has considered DST (Daylight Saving Time,
    // https://tc39.github.io/ecma262/#sec-daylight-saving-time-adjustment).
    // For example, system timezone is set as "Time Zone: America/Toronto",
    // then these code will get different result:
    // `new Date(1478411999999).getTimezoneOffset();  // get 240`
    // `new Date(1478412000000).getTimezoneOffset();  // get 300`
    // So we should not use `new Date`, but use `Date.UTC`.

    let hour = +match[4] || 0;
    if (match[8].toUpperCase() !== 'Z') {
      hour -= +match[8].slice(0, 3);
    }
    return new Date(
      Date.UTC(
        +match[1],
        +(match[2] || 1) - 1,
        +match[3] || 1,
        hour,
        +(match[5] || 0),
        +match[6] || 0,
        match[7] ? +match[7].substring(0, 3) : 0
      )
    );
  } else if (isNil(val)) {
    return new Date(NaN);
  }

  return new Date(Math.round(val as number));
}
