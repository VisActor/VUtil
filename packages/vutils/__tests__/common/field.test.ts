/* Adapted from vega by University of Washington Interactive Data Lab
 * https://vega.github.io/vega/
 * Licensed under the BSD-3-Clause

 * url: https://github.com/vega/vega/blob/main/packages/vega-util/test/field-test.js
 * License: https://github.com/vega/vega/blob/main/LICENSE
 * @license
 */

import { field } from '../../src';

test('field creates a field accessor', () => {
  const f = field('x');
  expect(typeof f).toBe('function');
  expect(f({ x: 'foo' })).toBe('foo');
  expect(f({ x: 0 })).toBe(0);
});

test('field(function(){})', () => {
  const func = (datum: any) => datum.x;
  const f = field(func);
  expect(typeof f).toBe('function');
  expect(f).toBe(func);
  expect(f({ x: 'foo' })).toBe('foo');
  expect(f({ x: 0 })).toBe(0);
});

test('field() of function array', () => {
  const funcA = (datum: any) => datum.x;
  const funcB = (datum: any) => datum.x1;

  const f = field([funcA, funcB]);
  expect(typeof f).toBe('function');
  expect(f({ x: 'foo', x1: '6' })).toEqual(['foo', '6']);
  expect(f({ x: 0 })).toEqual([0, undefined]);
});

test('field() of string array', () => {
  const f = field(['x', 'x1']);
  expect(typeof f).toBe('function');
  expect(f({ x: 'foo', x1: '6' })).toEqual(['foo', '6']);
  expect(f({ x: 0 })).toEqual([0, undefined]);
});
