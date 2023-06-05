import { getFormatFromValue, getTimeFormatter } from '../../src';

describe('getFormatFromValue', () => {
  it('getFormatFromValue("2012") should be "YYYY"', () => {
    expect(getFormatFromValue('2012')).toBe('YYYY');
  });

  it('getFormatFromValue("2012-12") should be "YYYY"', () => {
    expect(getFormatFromValue('2012-12')).toBe('YYYY-MM');
  });
});

describe('getTimeFormatter', () => {
  it('getTimeFormatter("YYYY")', () => {
    const formatter = getTimeFormatter('YYYY');
    expect(formatter('2012-12-01 12:22:00')).toBe('2012');

    expect(formatter('2012/12/01')).toBe('2012');
  });
});
