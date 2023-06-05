/* eslint-disable @typescript-eslint/no-empty-function */
import { isEqual } from '../../src';

describe('isEqual', () => {
  it('isEqual({a:1, b: [2, 3, 4]}, {a: 1, b: [2, 3, 4]}) should be true', () => {
    expect(isEqual({ a: 1, b: [2, 3, 4] }, { a: 1, b: [2, 3, 4] })).toBeTruthy();
  });

  it('isEqual({a:1, b: function}, {a: 1, b: function) should be false', () => {
    expect(isEqual({ a: 1, b: () => {} }, { a: 1, b: () => {} })).toBeFalsy();
  });

  it('should be equal when width object array', () => {
    const a = {
      points: [
        {
          x: 218.7131069919538,
          y: 52.46233188097247
        },
        {
          x: 217.93093466675265,
          y: 47.52389017799678
        }
      ],
      lineWidth: 1,
      strokeColor: '#999',
      strokeOpacity: 1
    };
    const b = {
      points: [
        {
          x: 218.7131069919538,
          y: 52.46233188097247
        },
        {
          x: 217.93093466675265,
          y: 47.52389017799678
        }
      ],
      lineWidth: 1,
      strokeColor: '#999',
      strokeOpacity: 1
    };
    expect(isEqual(a, b)).toBeTruthy();
  });
});
