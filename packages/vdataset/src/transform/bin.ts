import { isNil } from '@visactor/vutils';
import type { Transform } from '.';

export interface IBinOptions {
  field: string; // numeric field to bin
  bins?: number; // number of bins (default 10)
  thresholds?: number[]; // explicit bin edges
  step?: number; // optional fixed bin width (interval step). If provided, overrides bins.
  extent?: [number, number]; // optional [min, max] to use instead of data-driven
  includeValues?: boolean; // whether to keep the original items in each bin
}

/**
 * Bin transform: converts numeric field into histogram bins.
 * Returns an array of bins: { x0, x1, count, values? }
 */
export const bin: Transform = (data: Array<object>, options?: IBinOptions) => {
  const field = options?.field;
  if (!field) {
    return [];
  }

  const n = data.length;
  // compute data-driven extent
  let min = Infinity;
  let max = -Infinity;

  if (options?.extent) {
    min = options.extent[0];
    max = options.extent[1];
  } else {
    for (let i = 0; i < n; i++) {
      const v: any = (data[i] as any)[field];
      if (isNil(v)) {
        continue;
      }
      const num = +v;
      if (Number.isFinite(num)) {
        if (num < min) {
          min = num;
        }
        if (num > max) {
          max = num;
        }
      }
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || n === 0) {
    return [];
  }

  // build thresholds
  let thresholds: number[] | undefined;
  if (options && options.thresholds && options.thresholds.length) {
    // explicit thresholds provided by user
    thresholds = options.thresholds.slice();
    thresholds.sort((a, b) => a - b);
  } else if (options && typeof options.step === 'number' && options.step > 0) {
    // fixed bin width (step) provided: compute number of bins to cover [min, max]
    const stepSize = options.step;
    let startMin = min;

    if (!options.extent) {
      startMin = Math.floor(min / stepSize) * stepSize;
    }
    thresholds = [startMin];

    while (startMin < max) {
      startMin += stepSize;
      thresholds.push(startMin);
    }
  } else {
    // fallback to bins count (default 10)
    const bins = options?.bins && options.bins > 0 ? Math.floor(options.bins) : 10;
    const stepSize = (max - min) / bins;
    thresholds = new Array(bins + 1);
    for (let i = 0; i <= bins; i++) {
      thresholds[i] = i === bins ? max : min + stepSize * i;
    }
  }

  const numBins = Math.max(0, thresholds.length - 1);
  if (numBins === 0) {
    return [];
  }

  const out: any[] = new Array(numBins);
  for (let i = 0; i < numBins; i++) {
    out[i] = { x0: thresholds[i], x1: thresholds[i + 1], count: 0 };
    if (options?.includeValues) {
      out[i].values = [] as object[];
    }
  }

  // assign each datum to a bin (left-inclusive, right-exclusive except last bin includes max)
  for (let i = 0; i < n; i++) {
    const v: any = (data[i] as any)[field];
    if (v == null) {
      continue;
    }
    const num = +v;
    if (!Number.isFinite(num)) {
      continue;
    }

    // find bin index (linear scan is fine for moderate bin counts)
    for (let j = 0; j < numBins; j++) {
      const left = out[j].x0;
      const right = out[j].x1;
      const isLast = j === numBins - 1;
      if ((num >= left && num < right) || (isLast && num <= right)) {
        out[j].count++;
        if (options && options.includeValues) {
          out[j].values.push(data[i]);
        }
        break;
      }
    }
  }

  return out;
};

export default bin;
