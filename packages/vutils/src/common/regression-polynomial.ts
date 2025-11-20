import { visitPoints, rSquared } from './regression-linear';
import isNil from './isNil';
import { computeLinearCIComponents, invNorm, stdErrorsAt } from './regression-utils';

function solveLinearSystem(A: number[][], b: number[]): number[] {
  // Gaussian elimination with partial pivoting
  const n = b.length;
  // clone
  const M: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    M[i] = A[i].slice();
    M[i].push(b[i]);
  }

  for (let k = 0; k < n; k++) {
    // find pivot
    let maxRow = k;
    let maxVal = Math.abs(M[k][k]);
    for (let i = k + 1; i < n; i++) {
      const v = Math.abs(M[i][k]);
      if (v > maxVal) {
        maxVal = v;
        maxRow = i;
      }
    }
    if (maxRow !== k) {
      const tmp = M[k];
      M[k] = M[maxRow];
      M[maxRow] = tmp;
    }

    // singular check
    if (Math.abs(M[k][k]) < 1e-12) {
      // return least squares fallback zeros
      const res: number[] = new Array(n).fill(0);
      return res;
    }

    // normalize row
    for (let j = k + 1; j <= n; j++) {
      M[k][j] = M[k][j] / M[k][k];
    }
    M[k][k] = 1;

    // eliminate
    for (let i = 0; i < n; i++) {
      if (i === k) {
        continue;
      }
      const factor = M[i][k];
      if (factor === 0) {
        continue;
      }
      for (let j = k + 1; j <= n; j++) {
        M[i][j] -= factor * M[k][j];
      }
      M[i][k] = 0;
    }
  }

  const x: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = M[i][n];
  }
  return x;
}

export function regressionPolynomial(
  data: any[],
  x: (d: any) => number = d => d.x,
  y: (d: any) => number = d => d.y,
  options: { degree?: number; alpha?: number } = {}
) {
  let degree = options.degree ?? 0;
  if (degree < 0) {
    degree = 0;
  }
  const alpha = options.alpha ?? 0.5;
  const m = degree + 1;
  const sums: number[] = new Array(2 * degree + 1).fill(0);

  visitPoints(data, x, y, (dx, dy) => {
    let xp = 1;
    for (let k = 0; k < sums.length; k++) {
      sums[k] += xp;
      xp *= dx;
    }
  });

  // build normal matrix
  const A: number[][] = new Array(m);
  for (let i = 0; i < m; i++) {
    A[i] = new Array(m).fill(0);
    for (let j = 0; j < m; j++) {
      A[i][j] = sums[i + j];
    }
  }

  const B: number[] = new Array(m).fill(0);
  visitPoints(data, x, y, (dx, dy) => {
    let xp = 1;
    for (let k = 0; k < m; k++) {
      B[k] += dy * xp;
      xp *= dx;
    }
  });

  const coef = solveLinearSystem(A, B);

  const predict = (xx: number) => {
    let xp = 1;
    let v = 0;
    for (let k = 0; k < coef.length; k++) {
      v += coef[k] * xp;
      xp *= xx;
    }
    return v;
  };

  return {
    degree,
    coef,
    predict,
    rSquared: rSquared(
      data,
      x,
      y,
      (() => {
        // compute mean y
        let sum = 0;
        let cnt = 0;
        visitPoints(data, x, y, (_dx, dy) => {
          sum += dy;
          cnt++;
        });
        return cnt === 0 ? 0 : sum / cnt;
      })(),
      predict
    ),
    evaluateGrid(N: number) {
      const out: { x: number; y: number }[] = [];
      if (N <= 0) {
        return out;
      }
      // compute range
      let min = Infinity;
      let max = -Infinity;
      visitPoints(data, x, y, dx => {
        if (!isNil(dx)) {
          if (dx < min) {
            min = dx;
          }
          if (dx > max) {
            max = dx;
          }
        }
      });
      if (min === Infinity || max === -Infinity) {
        return out;
      }
      if (min === max) {
        const v = predict(min);
        for (let i = 0; i < N; i++) {
          out.push({ x: min, y: v });
        }
        return out;
      }
      const step = (max - min) / (N - 1);
      for (let i = 0; i < N; i++) {
        const px = i === N - 1 ? max : min + step * i;
        out.push({ x: px, y: predict(px) });
      }
      return out;
    },
    confidenceInterval(N: number = 50) {
      const out: { x: number; mean: number; lower: number; upper: number; predLower: number; predUpper: number }[] = [];

      if (N <= 0) {
        return out;
      }

      const comps = computeLinearCIComponents(data, x, y, predict);
      if (comps.n === 0) {
        return out;
      }

      const z = Math.abs(invNorm(1 - alpha / 2));
      if (comps.min === comps.max) {
        const v = predict(comps.min);
        const errs = stdErrorsAt(comps.min, comps);
        for (let i = 0; i < N; i++) {
          out.push({
            x: comps.min,
            mean: v,
            lower: v - z * errs.seMean,
            upper: v + z * errs.seMean,
            predLower: v - z * errs.sePred,
            predUpper: v + z * errs.sePred
          });
        }
        return out;
      }

      const step = (comps.max - comps.min) / (N - 1);
      for (let i = 0; i < N; i++) {
        const px = i === N - 1 ? comps.max : comps.min + step * i;
        const yh = predict(px);
        const errs = stdErrorsAt(px, comps);
        out.push({
          x: px,
          mean: yh,
          lower: yh - z * errs.seMean,
          upper: yh + z * errs.seMean,
          predLower: yh - z * errs.sePred,
          predUpper: yh + z * errs.sePred
        });
      }
      return out;
    }
  };
}

export default regressionPolynomial;
