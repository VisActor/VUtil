import { styleStringToObject, lowerCamelCaseToMiddle } from '../src';

describe('dom utils', () => {
  it('styleStringToObject', () => {
    expect(styleStringToObject(' color: red')).toEqual({ color: 'red' });
    expect(styleStringToObject(' line-height: 12px;')).toEqual({ 'line-height': '12px' });
    expect(styleStringToObject('font-size: 16px ; line-height: 12px;')).toEqual({
      'font-size': '16px',
      'line-height': '12px'
    });
  });

  it('lowerCamelCaseToMiddle', () => {
    expect(lowerCamelCaseToMiddle('lineHeight')).toBe('line-height');
    expect(lowerCamelCaseToMiddle('fontSize')).toBe('font-size');
  });
});
