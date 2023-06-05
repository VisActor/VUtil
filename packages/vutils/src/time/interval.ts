export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const MONTH = DAY * 31;
export const YEAR = DAY * 365;

export const yearFloor = (date: Date) => {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);

  return date;
};
export const yearOffset = (date: Date, step: number) => {
  date.setFullYear(date.getFullYear() + step);
  return date;
};

export const yearCount = (start: Date, end: Date) => {
  return end.getFullYear() - start.getFullYear();
};
export const yearField = (date: Date) => date.getFullYear();

export const utcYearFloor = (date: Date) => {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);

  return date;
};
export const utcYearOffset = (date: Date, step: number) => {
  date.setUTCFullYear(date.getUTCFullYear() + step);
  return date;
};

export const utcYearCount = (start: Date, end: Date) => {
  return end.getUTCFullYear() - start.getUTCFullYear();
};
export const utcYearField = (date: Date) => date.getUTCFullYear();

export const monthFloor = (date: Date) => {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);

  return date;
};
export const monthOffset = (date: Date, step: number) => {
  date.setMonth(date.getMonth() + step);

  return date;
};

export const monthCount = (start: Date, end: Date) => {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
};
export const monthField = (date: Date) => date.getMonth();

export const utcMonthFloor = (date: Date) => {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);

  return date;
};
export const utcMonthOffset = (date: Date, step: number) => {
  date.setUTCMonth(date.getUTCMonth() + step);

  return date;
};

export const utcMonthCount = (start: Date, end: Date) => {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
};
export const utcMonthField = (date: Date) => date.getUTCMonth();

export const dayFloor = (date: Date) => {
  date.setHours(0, 0, 0, 0);

  return date;
};
export const dayOffset = (date: Date, step: number) => {
  date.setDate(date.getDate() + step);
  return date;
};
export const dayCount = (start: Date, end: Date) => {
  return (+end - +start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * MINUTE) / DAY;
};
export const dayField = (date: Date) => date.getDate() - 1;

export const utcDayFloor = (date: Date) => {
  date.setUTCHours(0, 0, 0, 0);

  return date;
};
export const utcDayOffset = (date: Date, step: number) => {
  date.setUTCDate(date.getUTCDate() + step);
  return date;
};

export const utcDayCount = (start: Date, end: Date) => {
  return (+end - +start) / DAY;
};
export const utcDayField = (date: Date) => date.getUTCDate() - 1;

export const hourFloor = (date: Date) => {
  date.setTime(+date - date.getMilliseconds() - date.getSeconds() * SECOND - date.getMinutes() * MINUTE);

  return date;
};
export const hourOffset = (date: Date, step: number) => {
  date.setHours(date.getHours() + step);
  return date;
};

export const hourCount = (start: Date, end: Date) => {
  return (+end - +start) / HOUR;
};
export const hourField = (date: Date) => date.getHours();

export const utcHourFloor = (date: Date) => {
  date.setTime(+date - date.getUTCMilliseconds() - date.getUTCSeconds() * SECOND - date.getUTCMinutes() * MINUTE);

  return date;
};
export const utcHourOffset = (date: Date, step: number) => {
  date.setUTCHours(date.getUTCHours() + step);
  return date;
};

export const utcHourField = (date: Date) => date.getUTCHours();

export const minuteFloor = (date: Date) => {
  date.setTime(+date - date.getMilliseconds() - date.getSeconds() * SECOND);

  return date;
};
export const minuteOffset = (date: Date, step: number) => {
  date.setMinutes(date.getMinutes() + step);
  return date;
};

export const minuteCount = (start: Date, end: Date) => {
  return (+end - +start) / MINUTE;
};

export const minuteField = (date: Date) => {
  return date.getMinutes();
};

export const utcMinuteFloor = (date: Date) => {
  date.setTime(+date - date.getUTCMilliseconds() - date.getUTCSeconds() * SECOND);

  return date;
};
export const utcMinuteOffset = (date: Date, step: number) => {
  date.setUTCMinutes(date.getUTCMinutes() + step);
  return date;
};

export const utcMinuteField = (date: Date) => {
  return date.getUTCMinutes();
};

export const secondFloor = (date: Date) => {
  date.setTime(+date - date.getMilliseconds());

  return date;
};
export const secondOffset = (date: Date, step: number) => {
  date.setSeconds(date.getSeconds() + step);
  return date;
};

export const secondCount = (start: Date, end: Date) => {
  return (+end - +start) / SECOND;
};
export const secondField = (date: Date) => date.getSeconds();

export const utcSecondFloor = (date: Date) => {
  date.setTime(+date - date.getUTCMilliseconds());

  return date;
};
export const utcSecondOffset = (date: Date, step: number) => {
  date.setUTCSeconds(date.getUTCSeconds() + step);
  return date;
};

export const utcSecondField = (date: Date) => date.getUTCSeconds();

export const millisecondsFloor = (date: Date) => {
  return date;
};
export const millisecondsOffset = (date: Date, step: number) => {
  date.setTime(+date + step);
  return date;
};
export const millisecondsCount = (start: Date, end: Date) => +end - +start;

export const generateCeil = (floor: (d: Date) => Date, offset: (d: Date, step: number) => Date) => {
  return (date: Date) => {
    const n = new Date(+date - 1);

    offset(n, 1);
    floor(n);

    return n;
  };
};

export const generateCount = (floor: (d: Date) => Date, count: (start: Date, end: Date) => number) => {
  return (start: Date | number, end: Date | number) => {
    const a = new Date();
    const b = new Date();

    a.setTime(+start);
    b.setTime(+end);

    floor(a);
    floor(b);

    return Math.floor(count(a, b));
  };
};

export const generateStepInterval = (
  step: number,
  {
    floor,
    offset,
    field,
    count
  }: {
    floor: (d: Date) => Date;
    offset: (d: Date, step: number) => Date;
    count: (start: Date, end: Date) => number;
    field?: (d: Date) => number;
  }
) => {
  const s = Math.floor(step);

  if (!Number.isFinite(s) || s <= 0) {
    return null;
  }
  if (s <= 1) {
    return {
      floor,
      offset,
      ceil: generateCeil(floor, offset)
    };
  }
  const stepCount = generateCount(floor, count);
  const testFunc = field
    ? (d: Date) => {
        return field(d) % s === 0;
      }
    : (d: Date) => {
        return stepCount(0, d) % s === 0;
      };

  const stepFloor = (date: Date) => {
    if (!Number.isNaN(+date)) {
      floor(date);
      while (!testFunc(date)) {
        date.setTime(+date - 1);
        floor(date);
      }
    }

    return date;
  };

  const stepOffset = (date: Date, stepCount: number) => {
    if (!Number.isNaN(+date)) {
      if (s < 0) {
        while (++stepCount <= 0) {
          offset(date, -1);
          while (!testFunc(date)) {
            offset(date, -1);
          }
        }
      } else {
        while (--stepCount >= 0) {
          offset(date, +1);
          while (!testFunc(date)) {
            offset(date, +1);
          }
        }
      }
    }

    return date;
  };

  return {
    floor: stepFloor,
    offset: stepOffset,
    ceil: generateCeil(stepFloor, stepOffset)
  };
};

export const getIntervalOptions = (type: string, isUTC?: boolean) => {
  if (type === 'year' && isUTC) {
    return { floor: utcYearFloor, offset: utcYearOffset, count: utcYearCount, field: utcYearField };
  }
  if (type === 'month' && isUTC) {
    return { floor: utcMonthFloor, offset: utcMonthOffset, count: utcMonthCount, field: utcMonthField };
  }
  if (type === 'day' && isUTC) {
    return { floor: utcDayFloor, offset: utcDayOffset, count: utcDayCount, field: utcDayField };
  }
  if (type === 'hour' && isUTC) {
    return { floor: utcHourFloor, offset: utcHourOffset, count: hourCount, field: utcHourField };
  }
  if (type === 'minute' && isUTC) {
    return { floor: utcMinuteFloor, offset: utcMinuteOffset, count: minuteCount, field: utcMinuteField };
  }
  if (type === 'second' && isUTC) {
    return { floor: utcSecondFloor, offset: utcSecondOffset, count: secondCount, field: utcSecondField };
  }
  if (type === 'year') {
    return { floor: yearFloor, offset: yearOffset, count: yearCount, field: yearField };
  }
  if (type === 'month') {
    return { floor: monthFloor, offset: monthOffset, count: monthCount, field: monthField };
  }
  if (type === 'day') {
    return { floor: dayFloor, offset: dayOffset, count: dayCount, field: dayField };
  }
  if (type === 'hour') {
    return { floor: hourFloor, offset: hourOffset, count: hourCount, field: hourField };
  }
  if (type === 'minute') {
    return { floor: minuteFloor, offset: minuteOffset, count: minuteCount, field: minuteField };
  }
  if (type === 'second') {
    return { floor: secondFloor, offset: secondOffset, count: secondCount, field: secondField };
  }

  return { floor: millisecondsFloor, offset: millisecondsOffset, count: millisecondsCount };
};
