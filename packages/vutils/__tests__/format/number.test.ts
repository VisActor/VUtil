import { NumberUtil } from '../../src';
import { formatSpecifier } from '../../src/format/number/specifier';

const format = NumberUtil.getInstance().format;
const formatter = NumberUtil.getInstance().formatter;

test('format(specifier)(number) returns a string', () => {
  expect(typeof format('d', 0)).toBe('string');
});

test('format(specifier).toString() returns the normalized specifier', () => {
  expect(formatSpecifier('d').toString()).toBe(' >-d');
});

test('format(specifier) throws an error for invalid formats', () => {
  expect(formatSpecifier('foo')).toBe(undefined);
  expect(formatSpecifier('.-2s')).toBe(undefined);
  expect(formatSpecifier('.f')).toBe(undefined);
});

test('format(",.") unreasonable precision values are clamped to reasonable values', () => {
  expect(format('.30f', 0)).toBe('0.00000000000000000000');
  expect(format('.0g', 1)).toBe('1');
});

test('format("n") is equivalent to format(",g")', () => {
  expect(format('n', 123456.78)).toBe('123,457');
  expect(format(',g', 123456.78)).toBe('123,457');
});

test('format("012") is equivalent to format("0=12")', () => {
  expect(format('012', 123.456)).toBe('00000123.456');
  expect(format('0=12', 123.456)).toBe('00000123.456');
});

/** formatTrim */
test('format("~r") trims insignificant zeros', () => {
  const f = formatter('~r');
  expect(f(1)).toBe('1');
  expect(f(0.1)).toBe('0.1');
  expect(f(0.01)).toBe('0.01');
  expect(f(10.0001)).toBe('10.0001');
  expect(f(123.45)).toBe('123.45');
  expect(f(123.456)).toBe('123.456');
  expect(f(123.4567)).toBe('123.457');
  expect(f(0.000009)).toBe('0.000009');
  expect(f(0.0000009)).toBe('0.0000009');
  expect(f(0.00000009)).toBe('0.00000009');
  expect(f(0.111119)).toBe('0.111119');
  expect(f(0.1111119)).toBe('0.111112');
  expect(f(0.11111119)).toBe('0.111111');
});

test('format("~e") trims insignificant zeros', () => {
  const f = formatter('~e');
  expect(f(0)).toBe('0e+0');
  expect(f(42)).toBe('4.2e+1');
  expect(f(42000000)).toBe('4.2e+7');
  expect(f(0.042)).toBe('4.2e-2');
  expect(f(-4)).toBe('−4e+0');
  expect(f(-42)).toBe('−4.2e+1');
  expect(f(42000000000)).toBe('4.2e+10');
  expect(f(0.00000000042)).toBe('4.2e-10');
});

test('format(".4~e") trims insignificant zeros', () => {
  const f = formatter('.4~e');
  expect(f(0.00000000012345)).toBe('1.2345e-10');
  expect(f(0.0000000001234)).toBe('1.234e-10');
  expect(f(0.000000000123)).toBe('1.23e-10');
  expect(f(-0.00000000012345)).toBe('−1.2345e-10');
  expect(f(-0.0000000001234)).toBe('−1.234e-10');
  expect(f(-0.000000000123)).toBe('−1.23e-10');
  expect(f(12345000000)).toBe('1.2345e+10');
  expect(f(12340000000)).toBe('1.234e+10');
  expect(f(12300000000)).toBe('1.23e+10');
  expect(f(-12345000000)).toBe('−1.2345e+10');
  expect(f(-12340000000)).toBe('−1.234e+10');
  expect(f(-12300000000)).toBe('−1.23e+10');
});

test('format("~s") trims insignificant zeros', () => {
  const f = formatter('~s');
  expect(f(0)).toBe('0');
  expect(f(1)).toBe('1');
  expect(f(10)).toBe('10');
  expect(f(100)).toBe('100');
  expect(f(999.5)).toBe('999.5');
  expect(f(999500)).toBe('999.5k');
  expect(f(1000)).toBe('1k');
  expect(f(1400)).toBe('1.4k');
  expect(f(1500)).toBe('1.5k');
  expect(f(1500.5)).toBe('1.5005k');
  expect(f(1e-15)).toBe('1f');
  expect(f(1e-12)).toBe('1p');
  expect(f(1e-9)).toBe('1n');
  expect(f(1e-6)).toBe('1µ');
  expect(f(1e-3)).toBe('1m');
  expect(f(1)).toBe('1');
  expect(f(1e3)).toBe('1k');
  expect(f(1e6)).toBe('1M');
  expect(f(1e9)).toBe('1G');
  expect(f(1e12)).toBe('1T');
  expect(f(1e15)).toBe('1P');
});

test('format("~%") trims insignificant zeros', () => {
  const f = formatter('~%');
  expect(f(0)).toBe('0%');
  expect(f(0.1)).toBe('10%');
  expect(f(0.01)).toBe('1%');
  expect(f(0.001)).toBe('0.1%');
  expect(f(0.0001)).toBe('0.01%');
});

test('trimming respects commas', () => {
  const f = formatter(',~g');
  expect(f(10000.0)).toBe('10,000');
  expect(f(10000.1)).toBe('10,000.1');
});

test('format(.z) fix points to decimal value', () => {
  const f = formatter(',.2z');
  expect(f(10101)).toBe('10,101');
  expect(f(12334.2)).toBe('12,334.20');
});

test('format(.t) will truncate without rounding', () => {
  const f = formatter(',.2t');
  expect(f(1.39932156)).toBe('1.39');
  expect(f(10101.99999)).toBe('10,101.99');
});
