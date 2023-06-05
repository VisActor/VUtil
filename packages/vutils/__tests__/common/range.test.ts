import { range } from '../../src';

describe('range', () => {
  it('range(1)', () => {
    expect(range(1)).toEqual([0]);
  });

  it('range(1， 3)', () => {
    expect(range(1, 3)).toEqual([1, 2]);
  });

  it('range(1， 10, 2)', () => {
    expect(range(1, 10, 2)).toEqual([1, 3, 5, 7, 9]);
  });
});
