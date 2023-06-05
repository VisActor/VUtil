import { shuffleArray } from '../../src';

const values = [1, 2, 3, 4, 5, 6];

describe('shuffleArray', () => {
  it('shuffleArray(values) should change the order of array', () => {
    const result = shuffleArray(values.slice());

    expect(result).not.toEqual(values);
    expect(result.every(v => values.includes(v))).toBeTruthy();
    expect(values.every(v => result.includes(v))).toBeTruthy();
  });
});
