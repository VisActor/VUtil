import { normalizePadding } from '../src';

describe('padding', () => {
  it('normalizePadding', () => {
    expect(normalizePadding(3)).toEqual([3, 3, 3, 3]);
    expect(normalizePadding([3])).toEqual([3, 3, 3, 3]);
    expect(normalizePadding([3, 4])).toEqual([3, 4, 3, 4]);
    expect(normalizePadding([3, 4, 5])).toEqual([3, 4, 5, 4]);
    expect(normalizePadding([3, 4, 5, 6])).toEqual([3, 4, 5, 6]);
    // @ts-ignore
    expect(normalizePadding(null)).toEqual([0, 0, 0, 0]);

    expect(normalizePadding({})).toEqual([0, 0, 0, 0]);
    expect(normalizePadding({ top: 1 })).toEqual([1, 0, 0, 0]);
    expect(normalizePadding({ bottom: 1 })).toEqual([0, 0, 1, 0]);
    expect(normalizePadding({ left: 1 })).toEqual([0, 0, 0, 1]);
    expect(normalizePadding({ right: 1 })).toEqual([0, 1, 0, 0]);
  });
});
