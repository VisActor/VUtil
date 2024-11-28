import { minInArray, maxInArray, shuffleArray } from '../../src';

const values = [1, 2, 3, 4, 5, 6];

describe('shuffleArray', () => {
  it('shuffleArray(values) should change the order of array', () => {
    const result = shuffleArray(values.slice());

    expect(result).not.toEqual(values);
    expect(result.every(v => values.includes(v))).toBeTruthy();
    expect(values.every(v => result.includes(v))).toBeTruthy();
  });
});

describe('maxInArray and minInArray', () => {
  it('maxInArray/minInArray with custom compare function', () => {
    const list = [{ value: 1 }, { value: 3 }, { value: 2 }];
    const max = maxInArray(list, (a, b) => a.value - b.value);
    const min = minInArray(list, (a, b) => a.value - b.value);
    expect(max).toEqual(list[1]);
    expect(min).toEqual(list[0]);
  });
});
