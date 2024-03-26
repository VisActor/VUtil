import { precisionAdd, precisionSub, seedRandom } from '../../src/math';

describe('precision', () => {
  it('precision add', () => {
    expect(precisionAdd(0.1, 0.2)).toBe(0.3);
  });
  it('precision sub', () => {
    expect(precisionSub(33, 23.33)).toBe(9.67);
  });
  it('seed random', () => {
    expect(seedRandom(0)).toEqual(seedRandom(0));
    expect(seedRandom(0)).not.toEqual(seedRandom(1));
  });
});
