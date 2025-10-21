/**
 * Empirical Cumulative Distribution Function (ECDF)
 * Returns a factory that builds an evaluator over provided samples.
 * The evaluator exposes:
 * - evaluate(x:number) => proportion of samples <= x
 * - evaluate(xs:number[]) => number[]
 * - evaluateGrid(N:number) => { points: number[], cdf: number[] } over sample range
 */

export interface ECDFEvaluator {
  evaluate: (x: number | number[]) => number | number[];
  evaluateGrid: (N: number) => { x: number; y: number }[];
  n: number;
}

export function ecdf(data: number[]): ECDFEvaluator {
  const n = data.length;
  const sorted = data.slice().sort((a, b) => a - b);

  function evaluateSingle(x: number) {
    if (n === 0) {
      return 0;
    }
    // count of values <= x (upper bound index)
    let lo = 0;
    let hi = n; // exclusive
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (sorted[mid] <= x) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo / n;
  }

  function evaluate(x: number | number[]) {
    if (Array.isArray(x)) {
      const out: number[] = [];
      for (let i = 0; i < x.length; i++) {
        out.push(evaluateSingle(x[i]));
      }
      return out;
    }
    return evaluateSingle(x as number);
  }

  function evaluateGrid(N: number) {
    const out: { x: number; y: number }[] = [];
    if (N <= 0) {
      return out;
    }
    if (n === 0) {
      return out;
    }
    const min = sorted[0];
    const max = sorted[n - 1];
    if (min === max) {
      for (let i = 0; i < N; i++) {
        out.push({ x: min, y: 1 });
      }
      return out;
    }
    const step = (max - min) / (N - 1);
    for (let i = 0; i < N; i++) {
      const x = i === N - 1 ? max : min + step * i;

      out.push({ x, y: evaluateSingle(x) });
    }
    return out;
  }

  return {
    evaluate: evaluate as any,
    evaluateGrid,
    n
  };
}

export default ecdf;
