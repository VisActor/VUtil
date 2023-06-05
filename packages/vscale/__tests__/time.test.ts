import { getIntervalOptions, generateCeil } from '@visactor/vutils';
import { TimeScale } from '../src/time-scale';

it('time.domain([-1e50, 1e50]) is equivalent to time.domain([NaN, NaN])', () => {
  const x = new TimeScale().domain([-1e50, 1e50]);

  expect(Number.isNaN(+x.domain()[0])).toBeTruthy();
  expect(Number.isNaN(+x.domain()[1])).toBeTruthy();
  expect(x.ticks(10)).toEqual([]);
});

it('time.nice() is an alias for time.nice(10)', () => {
  const x = new TimeScale().domain([new Date(2009, 0, 1, 0, 17, 0, 0), new Date(2009, 0, 1, 23, 42, 0, 0)]);
  expect(x.nice().domain()).toEqual([new Date(2009, 0, 1, 0, 0, 0, 0), new Date(2009, 0, 2, 0, 0, 0, 0)]);
});

it('time.nice() can nice sub-second domains', () => {
  const x = new TimeScale().domain([new Date(2013, 0, 1, 12, 0, 0, 0), new Date(2013, 0, 1, 12, 0, 0, 128)]);

  expect(x.nice().domain()).toEqual([new Date(2013, 0, 1, 12, 0, 0, 0), new Date(2013, 0, 1, 12, 0, 0, 130)]);
});

it('time.nice() can nice multi-year domains', () => {
  const x = new TimeScale().domain([new Date(2001, 0, 1, 0, 0, 0, 0), new Date(2138, 0, 1, 0, 0, 0, 0)]);

  expect(x.nice().domain()).toEqual([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2140, 0, 1, 0, 0, 0, 0)]);
});

it('time.nice() can nice empty domains', () => {
  const x = new TimeScale().domain([new Date(2009, 0, 1, 0, 12, 0, 0), new Date(2009, 0, 1, 0, 12, 0, 0)]);
  expect(x.nice().domain()).toEqual([new Date(2009, 0, 1, 0, 12, 0, 0), new Date(2009, 0, 1, 0, 12, 0, 0)]);
});

it('time.nice(count) nices using the specified tick count', () => {
  const x = new TimeScale().domain([new Date(2009, 0, 1, 0, 17, 0, 0), new Date(2009, 0, 1, 23, 42, 0, 0)]);

  expect(x.nice(100).domain()).toEqual([new Date(2009, 0, 1, 0, 10, 0, 0), new Date(2009, 0, 1, 23, 50, 0, 0)]);
  expect(x.nice(10).domain()).toEqual([new Date(2009, 0, 1, 0, 0, 0, 0), new Date(2009, 0, 2, 0, 0, 0, 0)]);
});

it('time.nice(interval) nices using the specified time interval', () => {
  const x = new TimeScale().domain([new Date(2009, 0, 1, 0, 12, 0, 0), new Date(2009, 0, 1, 23, 48, 0, 0)]);
  const dayOptions = getIntervalOptions('day');
  const dayInterval = {
    ...dayOptions,
    ceil: generateCeil(dayOptions.floor, dayOptions.offset)
  };
  expect(x.nice(dayInterval).domain()).toEqual([new Date(2009, 0, 1, 0, 0, 0, 0), new Date(2009, 0, 2, 0, 0, 0, 0)]);

  const monthOptions = getIntervalOptions('month');
  const monthInterval = {
    ...monthOptions,
    ceil: generateCeil(monthOptions.floor, monthOptions.offset)
  };
  expect(x.nice(monthInterval).domain()).toEqual([new Date(2008, 12, 1, 0, 0, 0, 0), new Date(2009, 1, 1, 0, 0, 0, 0)]);

  const yearOptions = getIntervalOptions('year');
  const yearInterval = {
    ...yearOptions,
    ceil: generateCeil(yearOptions.floor, yearOptions.offset)
  };
  expect(x.nice(yearInterval).domain()).toEqual([new Date(2009, 0, 1, 0, 0, 0, 0), new Date(2010, 0, 1, 0, 0, 0, 0)]);
});

it('time.nice(interval) can nice empty domains', () => {
  const x = new TimeScale().domain([new Date(2009, 0, 1, 0, 12), new Date(2009, 0, 1, 0, 12)]);
  const dayOptions = getIntervalOptions('day');
  const dayInterval = {
    ...dayOptions,
    ceil: generateCeil(dayOptions.floor, dayOptions.offset)
  };
  expect(x.nice(dayInterval).domain()).toEqual([new Date(2009, 0, 1), new Date(2009, 0, 2)]);
});

it('time.nice(interval) can nice a polylinear domain, only affecting its extent', () => {
  const dayOptions = getIntervalOptions('day');
  const dayInterval = {
    ...dayOptions,
    ceil: generateCeil(dayOptions.floor, dayOptions.offset)
  };
  const x = new TimeScale()
    .domain([new Date(2009, 0, 1, 0, 12), new Date(2009, 0, 1, 23, 48), new Date(2009, 0, 2, 23, 48)])
    .nice(dayInterval);
  expect(x.domain()).toEqual([new Date(2009, 0, 1), new Date(2009, 0, 1, 23, 48), new Date(2009, 0, 3)]);
});

it('time.clone() isolates changes to the domain', () => {
  const x = new TimeScale().domain([new Date(2009, 0, 1), new Date(2010, 0, 1)]);
  const y = x.clone();
  x.domain([new Date(2010, 0, 1), new Date(2011, 0, 1)]);
  expect(y.domain()).toEqual([new Date(2009, 0, 1), new Date(2010, 0, 1)]);
  expect(x.scale(new Date(2010, 0, 1))).toBe(0);
  expect(y.scale(new Date(2010, 0, 1))).toBe(1);
  y.domain([new Date(2011, 0, 1), new Date(2012, 0, 1)]);
  expect(x.scale(new Date(2011, 0, 1))).toBe(1);
  expect(y.scale(new Date(2011, 0, 1))).toBe(0);
  expect(x.domain()).toEqual([new Date(2010, 0, 1), new Date(2011, 0, 1)]);
  expect(y.domain()).toEqual([new Date(2011, 0, 1), new Date(2012, 0, 1)]);
});

it('time.clone() isolates changes to the range', () => {
  const x = new TimeScale().domain([new Date(2009, 0, 1), new Date(2010, 0, 1)]);
  const y = x.clone();
  x.range([1, 2]);
  expect(x.invert(1)).toEqual(new Date(2009, 0, 1));
  expect(y.invert(1)).toEqual(new Date(2010, 0, 1));
  expect(y.range()).toEqual([0, 1]);
  y.range([2, 3]);
  expect(x.invert(2)).toEqual(new Date(2010, 0, 1));
  expect(y.invert(2)).toEqual(new Date(2009, 0, 1));
  expect(x.range()).toEqual([1, 2]);
  expect(y.range()).toEqual([2, 3]);
});

it('time.clone() isolates changes to clamping', () => {
  const x = new TimeScale().domain([new Date(2009, 0, 1), new Date(2010, 0, 1)]).clamp(true);
  const y = x.clone();
  x.clamp(false);
  expect(x.scale(new Date(2011, 0, 1))).toBe(2);
  expect(y.scale(new Date(2011, 0, 1))).toBe(1);
  expect(y.clamp()).toBeTruthy();
  y.clamp(false);
  expect(x.scale(new Date(2011, 0, 1))).toBe(2);
  expect(y.scale(new Date(2011, 0, 1))).toBe(2);
  expect(x.clamp()).toBeFalsy();
});

it('time.clamp(true).invert(value) never returns a value outside the domain', () => {
  const x = new TimeScale().clamp(true);
  expect(x.invert(0) instanceof Date).toBeTruthy();

  expect(+x.invert(-1)).toEqual(+x.domain()[0]);
  expect(+x.invert(0)).toEqual(+x.domain()[0]);
  expect(+x.invert(1)).toEqual(+x.domain()[1]);
  expect(+x.invert(2)).toEqual(+x.domain()[1]);
});

it('time.ticks(interval) observes the specified tick interval', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 1, 0, 0), new Date(2011, 0, 1, 12, 4, 4, 0)]);
  const minuteOptions = getIntervalOptions('minute');
  const minuteInterval = {
    ...minuteOptions,
    ceil: generateCeil(minuteOptions.floor, minuteOptions.offset)
  };

  expect(x.ticks(minuteInterval)).toEqual([
    new Date(2011, 0, 1, 12, 1),
    new Date(2011, 0, 1, 12, 2),
    new Date(2011, 0, 1, 12, 3),
    new Date(2011, 0, 1, 12, 4)
  ]);
});

it('time.ticks(count) can generate sub-second ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 0, 0, 0), new Date(2011, 0, 1, 12, 0, 1, 0)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 0, 0, 0),
    new Date(2011, 0, 1, 12, 0, 0, 200),
    new Date(2011, 0, 1, 12, 0, 0, 400),
    new Date(2011, 0, 1, 12, 0, 0, 600),
    new Date(2011, 0, 1, 12, 0, 0, 800),
    new Date(2011, 0, 1, 12, 0, 1, 0)
  ]);
});

it('time.ticks(count) can generate 1-second ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 0, 0, 0), new Date(2011, 0, 1, 12, 0, 4, 0)]);

  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 0, 0, 0),
    new Date(2011, 0, 1, 12, 0, 1, 0),
    new Date(2011, 0, 1, 12, 0, 2, 0),
    new Date(2011, 0, 1, 12, 0, 3, 0),
    new Date(2011, 0, 1, 12, 0, 4, 0)
  ]);
});

it('time.ticks(count) can generate 5-second ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 0, 0), new Date(2011, 0, 1, 12, 0, 20)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 0, 0),
    new Date(2011, 0, 1, 12, 0, 5),
    new Date(2011, 0, 1, 12, 0, 10),
    new Date(2011, 0, 1, 12, 0, 15),
    new Date(2011, 0, 1, 12, 0, 20)
  ]);
});

it('time.ticks(count) can generate 10-second ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 0, 0), new Date(2011, 0, 1, 12, 0, 50)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 0, 0),
    new Date(2011, 0, 1, 12, 0, 10),
    new Date(2011, 0, 1, 12, 0, 20),
    new Date(2011, 0, 1, 12, 0, 30),
    new Date(2011, 0, 1, 12, 0, 40),
    new Date(2011, 0, 1, 12, 0, 50)
  ]);
});

it('time.ticks(count) can generate 30-second ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 0, 0), new Date(2011, 0, 1, 12, 1, 50)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 0, 0),
    new Date(2011, 0, 1, 12, 0, 30),
    new Date(2011, 0, 1, 12, 1, 0),
    new Date(2011, 0, 1, 12, 1, 30)
  ]);
});

it('time.ticks(count) can generate 1-minute ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 0, 27), new Date(2011, 0, 1, 12, 4, 12)]);

  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 1),
    new Date(2011, 0, 1, 12, 2),
    new Date(2011, 0, 1, 12, 3),
    new Date(2011, 0, 1, 12, 4)
  ]);
});

it('time.ticks(count) can generate 5-minute ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 3, 27), new Date(2011, 0, 1, 12, 21, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 5),
    new Date(2011, 0, 1, 12, 10),
    new Date(2011, 0, 1, 12, 15),
    new Date(2011, 0, 1, 12, 20)
  ]);
});

it('time.ticks(count) can generate 10-minute ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 8, 27), new Date(2011, 0, 1, 13, 4, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 10),
    new Date(2011, 0, 1, 12, 20),
    new Date(2011, 0, 1, 12, 30),
    new Date(2011, 0, 1, 12, 40),
    new Date(2011, 0, 1, 12, 50),
    new Date(2011, 0, 1, 13, 0)
  ]);
});

it('time.ticks(count) can generate 30-minute ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 28, 27), new Date(2011, 0, 1, 14, 4, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 12, 30),
    new Date(2011, 0, 1, 13, 0),
    new Date(2011, 0, 1, 13, 30),
    new Date(2011, 0, 1, 14, 0)
  ]);
});

it('time.ticks(count) can generate 1-hour ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 12, 28, 27), new Date(2011, 0, 1, 16, 34, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 13, 0),
    new Date(2011, 0, 1, 14, 0),
    new Date(2011, 0, 1, 15, 0),
    new Date(2011, 0, 1, 16, 0)
  ]);
});

it('time.ticks(count) can generate 3-hour ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 14, 28, 27), new Date(2011, 0, 2, 1, 34, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 15, 0),
    new Date(2011, 0, 1, 18, 0),
    new Date(2011, 0, 1, 21, 0),
    new Date(2011, 0, 2, 0, 0)
  ]);
});

it('time.ticks(count) can generate 6-hour ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 16, 28, 27), new Date(2011, 0, 2, 14, 34, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 18, 0),
    new Date(2011, 0, 2, 0, 0),
    new Date(2011, 0, 2, 6, 0),
    new Date(2011, 0, 2, 12, 0)
  ]);
});

it('time.ticks(count) can generate 12-hour ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 16, 28, 27), new Date(2011, 0, 3, 21, 34, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 2, 0, 0),
    new Date(2011, 0, 2, 12, 0),
    new Date(2011, 0, 3, 0, 0),
    new Date(2011, 0, 3, 12, 0)
  ]);
});

it('time.ticks(count) can generate 1-day ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 1, 16, 28, 27), new Date(2011, 0, 5, 21, 34, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 2, 0, 0),
    new Date(2011, 0, 3, 0, 0),
    new Date(2011, 0, 4, 0, 0),
    new Date(2011, 0, 5, 0, 0)
  ]);
});

it('time.ticks(count) can generate 2-day ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 2, 16, 28, 27), new Date(2011, 0, 9, 21, 34, 12)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 3, 0, 0),
    new Date(2011, 0, 5, 0, 0),
    new Date(2011, 0, 7, 0, 0),
    new Date(2011, 0, 9, 0, 0)
  ]);
});

it('time.ticks(count) can generate 1-month ticks', () => {
  const x = new TimeScale().domain([new Date(2011, 0, 18), new Date(2011, 4, 2)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 1, 1, 0, 0),
    new Date(2011, 2, 1, 0, 0),
    new Date(2011, 3, 1, 0, 0),
    new Date(2011, 4, 1, 0, 0)
  ]);
});

it('time.ticks(count) can generate 3-month ticks', () => {
  const x = new TimeScale().domain([new Date(2010, 11, 18), new Date(2011, 10, 2)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 0, 0),
    new Date(2011, 3, 1, 0, 0),
    new Date(2011, 6, 1, 0, 0),
    new Date(2011, 9, 1, 0, 0)
  ]);
});

it('time.ticks(count) can generate 1-year ticks', () => {
  const x = new TimeScale().domain([new Date(2010, 11, 18), new Date(2014, 2, 2)]);
  expect(x.ticks(4)).toEqual([
    new Date(2011, 0, 1, 0, 0),
    new Date(2012, 0, 1, 0, 0),
    new Date(2013, 0, 1, 0, 0),
    new Date(2014, 0, 1, 0, 0)
  ]);
});

it('time.ticks(count) can generate multi-year ticks', () => {
  const x = new TimeScale().domain([new Date(1900, 11, 18), new Date(2014, 2, 2)]);

  expect(x.ticks(6)).toEqual([
    new Date(1920, 0, 1, 0, 0),
    new Date(1940, 0, 1, 0, 0),
    new Date(1960, 0, 1, 0, 0),

    new Date(1980, 0, 1, 0, 0),
    new Date(2000, 0, 1, 0, 0)
  ]);
});

it('time.ticks(count) returns one tick for an empty domain', () => {
  const x = new TimeScale().domain([new Date(2014, 2, 2), new Date(2014, 2, 2)]);
  expect(x.ticks(6)).toEqual([new Date(2014, 2, 2)]);
});

it('time.ticks() returns descending ticks for a descending domain', () => {
  const x = new TimeScale();
  expect(x.domain([new Date(2014, 2, 2), new Date(2010, 11, 18)]).ticks(4)).toEqual([
    new Date(2014, 0, 1, 0, 0),
    new Date(2013, 0, 1, 0, 0),
    new Date(2012, 0, 1, 0, 0),
    new Date(2011, 0, 1, 0, 0)
  ]);
  expect(x.domain([new Date(2011, 10, 2), new Date(2010, 11, 18)]).ticks(4)).toEqual([
    new Date(2011, 9, 1, 0, 0),
    new Date(2011, 6, 1, 0, 0),
    new Date(2011, 3, 1, 0, 0),
    new Date(2011, 0, 1, 0, 0)
  ]);
});

it("time.tickFormat()(date) formats year on New Year's", () => {
  const f = new TimeScale().tickFormat();
  expect(f(new Date(2011, 0, 1))).toBe('2011');
  expect(f(new Date(2012, 0, 1))).toBe('2012');
  expect(f(new Date(2013, 0, 1))).toBe('2013');
});

it('time.tickFormat()(date) formats minute on second zero', () => {
  const f = new TimeScale().tickFormat(null, 'HH:mm');
  expect(f(new Date(2011, 1, 2, 11, 59))).toBe('11:59');
  expect(f(new Date(2011, 1, 2, 12, 1))).toBe('12:01');
  expect(f(new Date(2011, 1, 2, 12, 2))).toBe('12:02');
});

it('time.tickFormat()(date) otherwise, formats second', () => {
  const f = new TimeScale().tickFormat(null, ':ss');
  expect(f(new Date(2011, 1, 2, 12, 1, 9))).toBe(':09');
  expect(f(new Date(2011, 1, 2, 12, 1, 10))).toBe(':10');
  expect(f(new Date(2011, 1, 2, 12, 1, 11))).toBe(':11');
});

it('time.tickFormat(count, specifier) returns a time format for the specified specifier', () => {
  const f = new TimeScale().tickFormat(10, 'd/M/YYYY, HH:mm:ss');
  expect(f(new Date(2011, 1, 2, 12))).toBe('2/2/2011, 12:00:00');
});
