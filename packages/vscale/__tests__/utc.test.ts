import { generateCeil, getIntervalOptions } from '@visactor/vutils';
import { TimeScale } from '../src/time-scale';

it('scaleUtc.nice() is an alias for scaleUtc.nice(10)', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2009, 0, 1, 0, 17)), new Date(Date.UTC(2009, 0, 1, 23, 42))]);
  expect(x.nice().domain()).toEqual([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2009, 0, 2))]);
});

it('scaleUtc.nice() can nice sub-second domains', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2013, 0, 1, 12, 0, 0, 0)),
    new Date(Date.UTC(2013, 0, 1, 12, 0, 0, 128))
  ]);
  expect(x.nice().domain()).toEqual([
    new Date(Date.UTC(2013, 0, 1, 12, 0, 0, 0)),
    new Date(Date.UTC(2013, 0, 1, 12, 0, 0, 130))
  ]);
});

it('scaleUtc.nice() can nice multi-year domains', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2001, 0, 1, 0, 0, 0, 0)),
    new Date(Date.UTC(2138, 0, 1, 0, 0, 0, 0))
  ]);
  expect(x.nice().domain()).toEqual([
    new Date(Date.UTC(2000, 0, 1, 0, 0, 0, 0)),
    new Date(Date.UTC(2140, 0, 1, 0, 0, 0, 0))
  ]);
});

it('scaleUtc.nice() can nice empty domains', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2009, 0, 1, 0, 12)), new Date(Date.UTC(2009, 0, 1, 0, 12))]);
  expect(x.nice().domain()).toEqual([new Date(Date.UTC(2009, 0, 1, 0, 12)), new Date(Date.UTC(2009, 0, 1, 0, 12))]);
});

it('scaleUtc.nice(count) nices using the specified tick count', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2009, 0, 1, 0, 17)), new Date(Date.UTC(2009, 0, 1, 23, 42))]);
  expect(x.nice(100).domain()).toEqual([new Date(Date.UTC(2009, 0, 1, 0, 10)), new Date(Date.UTC(2009, 0, 1, 23, 50))]);
  expect(x.nice(10).domain()).toEqual([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2009, 0, 2))]);
});

it('scaleUtc.nice(interval) nices using the specified time interval', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2009, 0, 1, 0, 12)), new Date(Date.UTC(2009, 0, 1, 23, 48))]);
  const dayOptions = getIntervalOptions('day', true);
  const dayInterval = {
    ...dayOptions,
    ceil: generateCeil(dayOptions.floor, dayOptions.offset)
  };
  const monthOptions = getIntervalOptions('month', true);
  const monthInterval = {
    ...monthOptions,
    ceil: generateCeil(monthOptions.floor, monthOptions.offset)
  };
  const yearOptions = getIntervalOptions('year', true);
  const yearInterval = {
    ...yearOptions,
    ceil: generateCeil(yearOptions.floor, yearOptions.offset)
  };

  expect(x.nice(dayInterval).domain()).toEqual([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2009, 0, 2))]);
  expect(x.nice(monthInterval).domain()).toEqual([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2009, 1, 1))]);
  expect(x.nice(yearInterval).domain()).toEqual([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2010, 0, 1))]);
});

it('scaleUtc.nice(interval) can nice empty domains', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2009, 0, 1, 0, 12)), new Date(Date.UTC(2009, 0, 1, 0, 12))]);
  const dayOptions = getIntervalOptions('day', true);
  const dayInterval = {
    ...dayOptions,
    ceil: generateCeil(dayOptions.floor, dayOptions.offset)
  };
  expect(x.nice(dayInterval).domain()).toEqual([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2009, 0, 2))]);
});

it('scaleUtc.nice(interval) can nice a polylinear domain, only affecting its extent', () => {
  const dayOptions = getIntervalOptions('day', true);
  const dayInterval = {
    ...dayOptions,
    ceil: generateCeil(dayOptions.floor, dayOptions.offset)
  };
  const x = new TimeScale(true)
    .domain([
      new Date(Date.UTC(2009, 0, 1, 0, 12)),
      new Date(Date.UTC(2009, 0, 1, 23, 48)),
      new Date(Date.UTC(2009, 0, 2, 23, 48))
    ])
    .nice(dayInterval);
  expect(x.domain()).toEqual([
    new Date(Date.UTC(2009, 0, 1)),
    new Date(Date.UTC(2009, 0, 1, 23, 48)),
    new Date(Date.UTC(2009, 0, 3))
  ]);
});

it('scaleUtc.clone() isolates changes to the domain', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2010, 0, 1))]);
  const y = x.clone();
  x.domain([new Date(Date.UTC(2010, 0, 1)), new Date(Date.UTC(2011, 0, 1))]);
  expect(y.domain()).toEqual([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2010, 0, 1))]);
  expect(x.scale(new Date(Date.UTC(2010, 0, 1)))).toBe(0);
  expect(y.scale(new Date(Date.UTC(2010, 0, 1)))).toBe(1);
  y.domain([new Date(Date.UTC(2011, 0, 1)), new Date(Date.UTC(2012, 0, 1))]);
  expect(x.scale(new Date(Date.UTC(2011, 0, 1)))).toBe(1);
  expect(y.scale(new Date(Date.UTC(2011, 0, 1)))).toBe(0);
  expect(x.domain()).toEqual([new Date(Date.UTC(2010, 0, 1)), new Date(Date.UTC(2011, 0, 1))]);
  expect(y.domain()).toEqual([new Date(Date.UTC(2011, 0, 1)), new Date(Date.UTC(2012, 0, 1))]);
});

it('scaleUtc.clone() isolates changes to the range', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2010, 0, 1))]);
  const y = x.clone();
  x.range([1, 2]);
  expect(x.invert(1)), new Date(Date.UTC(2009, 0, 1));
  expect(y.invert(1)), new Date(Date.UTC(2010, 0, 1));
  expect(y.range()).toEqual([0, 1]);
  y.range([2, 3]);
  expect(x.invert(2)), new Date(Date.UTC(2010, 0, 1));
  expect(y.invert(2)), new Date(Date.UTC(2009, 0, 1));
  expect(x.range()).toEqual([1, 2]);
  expect(y.range()).toEqual([2, 3]);
});

it('scaleUtc.clone() isolates changes to clamping', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2009, 0, 1)), new Date(Date.UTC(2010, 0, 1))]).clamp(true);
  const y = x.clone();
  x.clamp(false);
  expect(x.scale(new Date(Date.UTC(2011, 0, 1)))).toBe(2);
  expect(y.scale(new Date(Date.UTC(2011, 0, 1)))).toBe(1);
  expect(y.clamp()).toBeTruthy();
  y.clamp(false);
  expect(x.scale(new Date(Date.UTC(2011, 0, 1)))).toBe(2);
  expect(y.scale(new Date(Date.UTC(2011, 0, 1)))).toBe(2);
  expect(x.clamp()).toBeFalsy();
});

it('scaleUtc.ticks(interval) observes the specified tick interval', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 1, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 4, 4))
  ]);
  const options = getIntervalOptions('minute', true);
  const interval = {
    ...options,
    ceil: generateCeil(options.floor, options.offset)
  };

  expect(x.ticks(interval)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 1)),
    new Date(Date.UTC(2011, 0, 1, 12, 2)),
    new Date(Date.UTC(2011, 0, 1, 12, 3)),
    new Date(Date.UTC(2011, 0, 1, 12, 4))
  ]);
});

it('scaleUtc.ticks(interval) observes the specified named tick interval', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 1, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 4, 4))
  ]);
  const options = getIntervalOptions('minute', true);
  const interval = {
    ...options,
    ceil: generateCeil(options.floor, options.offset)
  };
  expect(x.ticks(interval)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 1)),
    new Date(Date.UTC(2011, 0, 1, 12, 2)),
    new Date(Date.UTC(2011, 0, 1, 12, 3)),
    new Date(Date.UTC(2011, 0, 1, 12, 4))
  ]);
});

it('scaleUtc.ticks(count) can generate sub-second ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 1))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0, 200)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0, 400)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0, 600)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0, 800)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 1, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 1-second ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 4))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 1)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 2)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 3)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 4))
  ]);
});

it('scaleUtc.ticks(count) can generate 5-second ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 20))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 5)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 10)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 15)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 20))
  ]);
});

it('scaleUtc.ticks(count) can generate 10-second ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 50))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 10)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 20)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 30)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 40)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 50))
  ]);
});

it('scaleUtc.ticks(count) can generate 30-second ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 1, 50))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 0, 30)),
    new Date(Date.UTC(2011, 0, 1, 12, 1, 0)),
    new Date(Date.UTC(2011, 0, 1, 12, 1, 30))
  ]);
});

it('scaleUtc.ticks(count) can generate 1-minute ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 0, 27)),
    new Date(Date.UTC(2011, 0, 1, 12, 4, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 1)),
    new Date(Date.UTC(2011, 0, 1, 12, 2)),
    new Date(Date.UTC(2011, 0, 1, 12, 3)),
    new Date(Date.UTC(2011, 0, 1, 12, 4))
  ]);
});

it('scaleUtc.ticks(count) can generate 5-minute ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 3, 27)),
    new Date(Date.UTC(2011, 0, 1, 12, 21, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 5)),
    new Date(Date.UTC(2011, 0, 1, 12, 10)),
    new Date(Date.UTC(2011, 0, 1, 12, 15)),
    new Date(Date.UTC(2011, 0, 1, 12, 20))
  ]);
});

it('scaleUtc.ticks(count) can generate 10-minute ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 8, 27)),
    new Date(Date.UTC(2011, 0, 1, 13, 4, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 10)),
    new Date(Date.UTC(2011, 0, 1, 12, 20)),
    new Date(Date.UTC(2011, 0, 1, 12, 30)),
    new Date(Date.UTC(2011, 0, 1, 12, 40)),
    new Date(Date.UTC(2011, 0, 1, 12, 50)),
    new Date(Date.UTC(2011, 0, 1, 13, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 30-minute ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 28, 27)),
    new Date(Date.UTC(2011, 0, 1, 14, 4, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 12, 30)),
    new Date(Date.UTC(2011, 0, 1, 13, 0)),
    new Date(Date.UTC(2011, 0, 1, 13, 30)),
    new Date(Date.UTC(2011, 0, 1, 14, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 1-hour ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 12, 28, 27)),
    new Date(Date.UTC(2011, 0, 1, 16, 34, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 13, 0)),
    new Date(Date.UTC(2011, 0, 1, 14, 0)),
    new Date(Date.UTC(2011, 0, 1, 15, 0)),
    new Date(Date.UTC(2011, 0, 1, 16, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 3-hour ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 14, 28, 27)),
    new Date(Date.UTC(2011, 0, 2, 1, 34, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 15, 0)),
    new Date(Date.UTC(2011, 0, 1, 18, 0)),
    new Date(Date.UTC(2011, 0, 1, 21, 0)),
    new Date(Date.UTC(2011, 0, 2, 0, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 6-hour ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 16, 28, 27)),
    new Date(Date.UTC(2011, 0, 2, 14, 34, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 18, 0)),
    new Date(Date.UTC(2011, 0, 2, 0, 0)),
    new Date(Date.UTC(2011, 0, 2, 6, 0)),
    new Date(Date.UTC(2011, 0, 2, 12, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 12-hour ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 16, 28, 27)),
    new Date(Date.UTC(2011, 0, 3, 21, 34, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 2, 0, 0)),
    new Date(Date.UTC(2011, 0, 2, 12, 0)),
    new Date(Date.UTC(2011, 0, 3, 0, 0)),
    new Date(Date.UTC(2011, 0, 3, 12, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 1-day ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 16, 28, 27)),
    new Date(Date.UTC(2011, 0, 5, 21, 34, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 2, 0, 0)),
    new Date(Date.UTC(2011, 0, 3, 0, 0)),
    new Date(Date.UTC(2011, 0, 4, 0, 0)),
    new Date(Date.UTC(2011, 0, 5, 0, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 2-day ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 2, 16, 28, 27)),
    new Date(Date.UTC(2011, 0, 9, 21, 34, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 3, 0, 0)),
    new Date(Date.UTC(2011, 0, 5, 0, 0)),
    new Date(Date.UTC(2011, 0, 7, 0, 0)),
    new Date(Date.UTC(2011, 0, 9, 0, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 7-day ticks', () => {
  const x = new TimeScale(true).domain([
    new Date(Date.UTC(2011, 0, 1, 16, 28, 27)),
    new Date(Date.UTC(2011, 0, 23, 21, 34, 12))
  ]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 8, 0, 0)),
    new Date(Date.UTC(2011, 0, 15, 0, 0)),
    new Date(Date.UTC(2011, 0, 22, 0, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 1-month ticks', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2011, 0, 18)), new Date(Date.UTC(2011, 4, 2))]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 1, 1, 0, 0)),
    new Date(Date.UTC(2011, 2, 1, 0, 0)),
    new Date(Date.UTC(2011, 3, 1, 0, 0)),
    new Date(Date.UTC(2011, 4, 1, 0, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 3-month ticks', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2010, 11, 18)), new Date(Date.UTC(2011, 10, 2))]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 0, 0)),
    new Date(Date.UTC(2011, 3, 1, 0, 0)),
    new Date(Date.UTC(2011, 6, 1, 0, 0)),
    new Date(Date.UTC(2011, 9, 1, 0, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate 1-year ticks', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2010, 11, 18)), new Date(Date.UTC(2014, 2, 2))]);
  expect(x.ticks(4)).toEqual([
    new Date(Date.UTC(2011, 0, 1, 0, 0)),
    new Date(Date.UTC(2012, 0, 1, 0, 0)),
    new Date(Date.UTC(2013, 0, 1, 0, 0)),
    new Date(Date.UTC(2014, 0, 1, 0, 0))
  ]);
});

it('scaleUtc.ticks(count) can generate multi-year ticks', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(1900, 11, 18)), new Date(Date.UTC(2014, 2, 2))]);
  expect(x.ticks(6)).toEqual([
    new Date(Date.UTC(1920, 0, 1, 0, 0)),
    new Date(Date.UTC(1940, 0, 1, 0, 0)),
    new Date(Date.UTC(1960, 0, 1, 0, 0)),
    new Date(Date.UTC(1980, 0, 1, 0, 0)),
    new Date(Date.UTC(2000, 0, 1, 0, 0))
  ]);
});

it('scaleUtc.ticks(count) returns one tick for an empty domain', () => {
  const x = new TimeScale(true).domain([new Date(Date.UTC(2014, 2, 2)), new Date(Date.UTC(2014, 2, 2))]);
  expect(x.ticks(6)).toEqual([new Date(Date.UTC(2014, 2, 2))]);
});

it("scaleUtc.tickFormat()(date) formats year on New Year's", () => {
  const f = new TimeScale(true).tickFormat();
  expect(f(new Date(Date.UTC(2011, 0, 1)))).toBe('2011');
  expect(f(new Date(Date.UTC(2012, 0, 1)))).toBe('2012');
  expect(f(new Date(Date.UTC(2013, 0, 1)))).toBe('2013');
});

it('scaleUtc.tickFormat()(date) formats minute on second zero', () => {
  const f = new TimeScale(true).tickFormat(null, 'hh:mm');
  expect(f(new Date(Date.UTC(2011, 1, 2, 11, 59)))).toBe('11:59');
  expect(f(new Date(Date.UTC(2011, 1, 2, 12, 1)))).toBe('12:01');
  expect(f(new Date(Date.UTC(2011, 1, 2, 12, 2)))).toBe('12:02');
});

it('scaleUtc.tickFormat()(date) otherwise, formats second', () => {
  const f = new TimeScale(true).tickFormat(null, ':ss');
  expect(f(new Date(Date.UTC(2011, 1, 2, 12, 1, 9)))).toBe(':09');
  expect(f(new Date(Date.UTC(2011, 1, 2, 12, 1, 10)))).toBe(':10');
  expect(f(new Date(Date.UTC(2011, 1, 2, 12, 1, 11)))).toBe(':11');
});

it('scaleUtc.tickFormat(count, specifier) returns a time format for the specified specifier', () => {
  const f = new TimeScale(true).tickFormat(10, 'd/M/YYYY, HH:mm:ss');
  expect(f(new Date(Date.UTC(2011, 1, 2, 12)))).toBe('2/2/2011, 12:00:00');
});
