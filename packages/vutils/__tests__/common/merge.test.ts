import { merge } from '../../src';

describe('merge', () => {
  it('should merge `source` into `object`', function () {
    const names = {
      line: {
        style: {
          lineWidth: 1,
          lineDash: [2, 2]
        }
      }
    };

    const ages = {
      line: {
        x: 10,
        y: 10
      }
    };

    const heights = {
      point: {
        shape: 'circle'
      },
      line: {
        style: {
          lineDash: [2, 5]
        }
      }
    };

    const expected = {
      line: {
        x: 10,
        y: 10,
        style: {
          lineWidth: 1,
          lineDash: [2, 5]
        }
      },
      point: {
        shape: 'circle'
      }
    };
    const result = merge({}, names, ages, heights);

    expect(names).toEqual({
      line: {
        style: {
          lineWidth: 1,
          lineDash: [2, 2]
        }
      }
    });

    expect(result).toEqual(expected);
  });
  it('null value in target should not throw error', function () {
    const target: any = {
      style: {
        stroke: null
      }
    };

    const source = {
      style: {
        stroke: { type: 'palette', key: 'color1' }
      }
    };

    const expected = {
      style: {
        stroke: { type: 'palette', key: 'color1' }
      }
    };

    const result = merge(target, source);

    expect(result).toEqual(expected);
  });
});
