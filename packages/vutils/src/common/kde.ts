/**
 * Kernel Density Estimation (KDE) utilities
 *
 * Exports:
 * - Kernel functions: gaussian, epanechnikov
 * - bandwidth selectors: scott, silverman
 * - kde: main function to compute density estimates at provided points
 */

import { mean } from './mean';
import { variance } from './variance';

export type Kernel = (u: number) => number;

/** Gaussian kernel (standard normal) */
export const gaussian: Kernel = (u: number) => {
  const invSqrt2Pi = 1 / Math.sqrt(2 * Math.PI);
  return invSqrt2Pi * Math.exp(-0.5 * u * u);
};

/** Epanechnikov kernel (compact support) */
export const epanechnikov: Kernel = (u: number) => {
  const absu = Math.abs(u);
  return absu <= 1 ? 0.75 * (1 - u * u) : 0;
};

/**
 * Bandwidth selectors
 * - scott: h = n^{-1/(d+4)} * std
 * - silverman: h = ( (4/(d+2))^{1/(d+4)} ) * n^{-1/(d+4)} * std
 */
export function scott(n: number, std: number, dim = 1) {
  if (n <= 0 || std === 0) {
    return 0;
  }
  return std * Math.pow(n, -1 / (dim + 4));
}

export function silverman(n: number, std: number, dim = 1) {
  if (n <= 0 || std === 0) {
    return 0;
  }
  const factor = Math.pow(4 / (dim + 2), 1 / (dim + 4));
  return factor * std * Math.pow(n, -1 / (dim + 4));
}

export interface KDEOptions {
  kernel?: Kernel;
  bandwidth?: number; // fixed bandwidth
  bandwidthMethod?: 'scott' | 'silverman';
  /** Automatic bandwidth uses population deviation by default, preserving existing behavior. */
  standardDeviation?: 'sample' | 'population';
  /** Positive multiplier applied once to either fixed or automatic bandwidth. */
  bandwidthAdjust?: number;
  // if bandwidth not provided, compute from data using method
}

/**
 * Compute standard deviation for numeric array
 */
function std(values: number[], convention: 'sample' | 'population') {
  const n = values.length;
  if (n < 2) {
    return 0;
  }
  const center = mean(values);
  const differences: number[] = [];
  let scale = 0;
  let sourceScale = 1;
  for (let i = 0; i < n; i++) {
    const difference = values[i] - center;
    differences.push(difference);
    scale = Math.max(scale, Math.abs(difference));
  }
  // Finite values of opposite signs can overflow subtraction although population deviation is representable.
  if (scale === Infinity) {
    sourceScale = Math.abs(center);
    for (const value of values) {
      sourceScale = Math.max(sourceScale, Math.abs(value));
    }
    scale = 0;
    for (let i = 0; i < n; i++) {
      differences[i] = values[i] / sourceScale - center / sourceScale;
      scale = Math.max(scale, Math.abs(differences[i]));
    }
  }
  if (scale === 0) {
    return 0;
  }
  for (let i = 0; i < n; i++) {
    differences[i] /= scale;
  }
  const correction = convention === 'population' ? (n - 1) / n : 1;
  return Math.sqrt(variance(differences) * correction) * scale * sourceScale;
}

export interface KDEEvaluator {
  bandwidth: number;
  kernel: Kernel;
  /**
   * Evaluate density at a single point or array of points.
   * - If given a number, returns a number.
   * - If given an array, returns an array aligned with input.
   */
  evaluate: ((x: number) => number) & ((xs: number[]) => number[]);
  /**
   * Produce N uniformly spaced points across the data range and evaluate densities.
   * Returns an array { x: number, y: number }[].
   */
  evaluateGrid: (N: number) => { x: number; y: number }[];
}

/**
 * Factory: create a KDE evaluator for given data and options.
 * Usage: const model = kde(data, options); model.evaluate(x) or model.evaluate([x1,x2])
 */
export function kde(data: number[], options: KDEOptions = {}): KDEEvaluator {
  const deviation = options.standardDeviation === undefined ? 'population' : options.standardDeviation;
  const adjustment = options.bandwidthAdjust === undefined ? 1 : options.bandwidthAdjust;
  if (deviation !== 'sample' && deviation !== 'population') {
    throw new RangeError('standardDeviation must be sample or population');
  }
  if (!Number.isFinite(adjustment) || adjustment <= 0) {
    throw new RangeError('bandwidthAdjust must be finite and positive');
  }
  const n = data.length;
  const kernel = options.kernel || gaussian;

  let h = options.bandwidth;
  if (!h || h <= 0) {
    const sd = std(data, deviation) || 0;
    const method = options.bandwidthMethod || 'scott';
    if (method === 'silverman') {
      h = silverman(n, sd, 1);
    } else {
      h = scott(n, sd, 1);
    }
  }
  h *= adjustment;

  // if still zero (constant data), evaluator returns zeros
  if (!h || h <= 0) {
    const zerosEval = (x: number | number[]) => {
      if (Array.isArray(x)) {
        const out: number[] = [];
        for (let i = 0; i < x.length; i++) {
          out.push(0);
        }
        return out;
      }
      return 0;
    };
    const zerosGrid = (N: number) => {
      const out: { x: number; y: number }[] = [];
      if (N <= 0) {
        return out;
      }
      // compute data min (use data range if available)
      let min = Infinity;
      let max = -Infinity;
      for (let j = 0; j < n; j++) {
        const v = data[j];
        if (v < min) {
          min = v;
        }
        if (v > max) {
          max = v;
        }
      }
      if (min === Infinity || max === -Infinity) {
        for (let i = 0; i < N; i++) {
          out.push({ x: 0, y: 0 });
        }
        return out;
      }
      for (let i = 0; i < N; i++) {
        out.push({ x: min, y: 0 });
      }
      return out;
    };
    return {
      bandwidth: 0,
      kernel,
      evaluate: zerosEval as any,
      evaluateGrid: zerosGrid
    };
  }

  const invNh = 1 / n / h;

  function evalPoint(x: number) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += kernel((x - data[j]) / h);
    }
    return sum * invNh;
  }

  function evaluate(x: number | number[]) {
    if (Array.isArray(x)) {
      const out: number[] = [];
      for (let i = 0; i < x.length; i++) {
        out.push(evalPoint(x[i]));
      }
      return out;
    }
    return evalPoint(x as number);
  }

  return {
    bandwidth: h,
    kernel,
    evaluate: evaluate as any,
    evaluateGrid(N: number) {
      const out: { x: number; y: number }[] = [];
      if (N <= 0) {
        return out;
      }
      // compute data range
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < n; i++) {
        const v = data[i];
        if (v < min) {
          min = v;
        }
        if (v > max) {
          max = v;
        }
      }
      if (min === Infinity || max === -Infinity) {
        return out;
      }
      if (min === max) {
        // single point repeated
        for (let i = 0; i < N; i++) {
          out.push({ x: min, y: evalPoint(min) });
        }
        return out;
      }

      const step = (max - min) / (N - 1);
      for (let i = 0; i < N; i++) {
        const x = i === N - 1 ? max : min + step * i;
        out.push({ x, y: evalPoint(x) });
      }
      return out;
    }
  };
}

export default kde;
