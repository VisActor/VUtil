import { correlation } from '../src';
describe('correlation', () => {
  test('Pearson / ranks / tau-b', () => {
    expect(correlation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1, 12);
    expect(correlation([1, 1, 2], [1, 2, 3], 'spearman')).toBeCloseTo(Math.sqrt(3) / 2, 12);
    expect(correlation([1, 1, 2], [1, 2, 3], 'kendall')).toBeCloseTo(Math.sqrt(2 / 3), 12);
    expect(correlation([12, 2, 1, 12, 2], [1, 4, 7, 1, 0], 'kendall')).toBeCloseTo(-0.47140452079103173, 12);
  });
  test('undefined and invalid inputs', () => {
    expect(correlation([1, 1], [1, 2])).toBeUndefined();
    expect(correlation([], [])).toBeUndefined();
    expect(() => correlation([1], [])).toThrow(RangeError);
    expect(() => correlation([NaN], [1])).toThrow(RangeError);
    expect(() => correlation([1], [1], 'other' as any)).toThrow(RangeError);
  });
  test('finite extremes and input ownership', () => {
    const x = Object.freeze([-1e308, 0, 1e308]);
    expect(correlation(x, x)).toBeCloseTo(1, 12);
    expect(correlation(x, x, 'kendall')).toBe(1);
    expect(correlation(Object.freeze([3, 1, 2]), [3, 1, 2], 'spearman')).toBeCloseTo(1, 12);
  });
});

function pairwiseKendall(x: readonly number[], y: readonly number[]): number | undefined {
  let concordant = 0;
  let discordant = 0;
  let tiesXOnly = 0;
  let tiesYOnly = 0;
  for (let i = 0; i < x.length; i++) {
    for (let j = i + 1; j < x.length; j++) {
      const dx = Math.sign(x[j] - x[i]);
      const dy = Math.sign(y[j] - y[i]);
      if (dx === 0 && dy !== 0) {
        tiesXOnly++;
      } else if (dy === 0 && dx !== 0) {
        tiesYOnly++;
      } else if (dx * dy > 0) {
        concordant++;
      } else if (dx * dy < 0) {
        discordant++;
      }
    }
  }
  const untied = concordant + discordant;
  const denominator = Math.sqrt((untied + tiesXOnly) * (untied + tiesYOnly));
  return denominator === 0 ? undefined : (concordant - discordant) / denominator;
}

test('Kendall tau-b agrees with independently counted pairs and ties', () => {
  for (let fixture = 0; fixture < 40; fixture++) {
    const x = Array.from({ length: 12 }, (_, i) => (i * 7 + fixture) % 5);
    const y = Array.from({ length: 12 }, (_, i) => ((i + fixture) * (i + 3)) % 7);
    const expected = pairwiseKendall(x, y);
    expect(correlation(x, y, 'kendall')).toBeCloseTo(expected!, 12);
    expect(correlation(y, x, 'kendall')).toBeCloseTo(expected!, 12);
    expect(correlation([...x].reverse(), [...y].reverse(), 'kendall')).toBeCloseTo(expected!, 12);
  }
});

test.each(['pearson', 'spearman', 'kendall'] as const)('%s handles constant and insufficient samples', method => {
  expect(correlation([1], [2], method)).toBeUndefined();
  expect(correlation([1, 1, 1], [1, 2, 3], method)).toBeUndefined();
  expect(correlation([1, 2, 3], [1, 1, 1], method)).toBeUndefined();
});
