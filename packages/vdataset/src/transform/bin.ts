import { isNil, isArray } from '@visactor/vutils';
import type { Transform } from '.';

export interface IBinOptions {
  /**
   * numeric field to bin
   */
  field: string;
  /**
   * count of numeric field
   */
  countField?: string;
  /**
   *  number of bins (default 10)
   */
  bins?: number;
  /**
   *  explicit bin edges
   */
  thresholds?: number[];
  /**
   * optional fixed bin width (interval step). If provided, overrides bins.
   */
  step?: number;
  /**
   * optional [min, max] to use instead of data-driven
   */
  extent?: [number, number];
  /**
   * whether to keep the original items in each bin
   */
  includeValues?: boolean;
  /** optional grouping field(s): when provided, counts are aggregated per group per bin (groups counted as units) */
  groupField?: string | string[];
  /** subView Field */
  subViewField?: string | string[];
  /**
   * the field name of output data
   */
  outputNames?: { x0?: string; x1?: string; count?: string; values?: string; percentage?: string };
}

interface ISubBinOptions extends IBinOptions {
  numBins: number;
  countName: string;
  countField: string;
  valuesName: string;
  percentageName: string;
  field: string;
  thresholds: number[];
  n: number;
  x0Name: string;
  x1Name: string;
}

const subBin: Transform = (data: Array<object>, options: ISubBinOptions) => {
  const { numBins, thresholds, countName, percentageName, valuesName, countField, field, n, x0Name, x1Name } = options;

  // we'll build outputs later; if no grouping, pre-create per-bin outputs
  const out: any[] = [];
  if (!options.groupField) {
    for (let i = 0; i < numBins; i++) {
      const rec: any = { [x0Name]: thresholds[i], [x1Name]: thresholds[i + 1], [countName]: 0 };
      if (options.includeValues) {
        rec[valuesName] = [] as object[];
      }
      out.push(rec);
    }
  }

  const groupField = options.groupField;
  const usingGroup = !!groupField;

  // when grouping, keep per-bin maps from groupKey -> aggregated weight, values and representative group object
  const binGroupCounts: Array<Map<string, number>> = usingGroup ? new Array(numBins).fill(0).map(() => new Map()) : [];
  const binGroupValues: Array<Map<string, any[]>> = usingGroup ? new Array(numBins).fill(0).map(() => new Map()) : [];
  const binGroupRepr: Array<Map<string, any>> = usingGroup ? new Array(numBins).fill(0).map(() => new Map()) : [];

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
      const left = thresholds[j];
      const right = thresholds[j + 1];
      const isLast = j === numBins - 1;
      if ((num >= left && num < right) || (isLast && num <= right)) {
        const datumCount = (data[i] as any)[countField] ?? 1;
        if (usingGroup) {
          // compute group key
          let gk: string;
          if (isArray(groupField)) {
            gk = (groupField as string[]).map(f => String((data[i] as any)[f])).join('||');
          } else {
            gk = String((data[i] as any)[groupField as string]);
          }
          const m = binGroupCounts[j];
          const prev = m.get(gk) ?? 0;
          m.set(gk, prev + datumCount);
          // store representative group value/object
          const repMap = binGroupRepr[j];
          if (!repMap.has(gk)) {
            if (isArray(groupField)) {
              repMap.set(gk, Object.fromEntries((groupField as string[]).map(f => [f, (data[i] as any)[f]])));
            } else {
              repMap.set(gk, (data[i] as any)[groupField as string]);
            }
          }
          // collect values per group if needed
          if (options && options.includeValues) {
            const vv = binGroupValues[j];
            if (!vv.has(gk)) {
              vv.set(gk, []);
            }
            const arr = vv.get(gk);
            if (arr) {
              arr.push(data[i]);
            }
          }
        } else {
          out[j][countName] += datumCount;
        }
        if (options && options.includeValues && !usingGroup) {
          out[j][valuesName].push(data[i]);
        }
        break;
      }
    }
  }

  // compute counts and totalCount, and build final outputs
  let totalCount = 0;
  const finalOut: any[] = [];
  if (usingGroup) {
    for (let j = 0; j < numBins; j++) {
      const m = binGroupCounts[j];
      for (const [gk, sum] of m) {
        totalCount += sum;
        const rec: any = { [x0Name]: thresholds[j], [x1Name]: thresholds[j + 1], [countName]: sum };
        // attach group fields
        const repr = binGroupRepr[j].get(gk);
        if (isArray(groupField)) {
          for (const f of groupField as string[]) {
            rec[f] = repr[f];
          }
        } else {
          rec[groupField as string] = repr;
        }
        if (options && options.includeValues) {
          rec[valuesName] = binGroupValues[j].get(gk) || [];
        }
        finalOut.push(rec);
      }
    }
    // compute percentages
    for (const r of finalOut) {
      r[percentageName] = totalCount > 0 ? r[countName] / totalCount : 0;
    }
  } else {
    for (let i = 0, len = out.length; i < len; i++) {
      totalCount += out[i][countName];
    }
    for (let i = 0, len = out.length; i < len; i++) {
      out[i][percentageName] = totalCount > 0 ? out[i][countName] / totalCount : 0;
      finalOut.push(out[i]);
    }
  }

  return finalOut;
};
/**
 * Bin transform: converts numeric field into histogram bins.
 * Returns an array of bins: { x0, x1, count, values? }
 */
export const bin: Transform = (data: Array<object>, options?: IBinOptions) => {
  const field = options?.field;
  if (!field) {
    return [];
  }
  const countField = options.countField;
  const n = data.length;
  // compute data-driven extent
  let min = Infinity;
  let max = -Infinity;

  if (options.extent) {
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
  if (options.thresholds && options.thresholds.length) {
    // explicit thresholds provided by user
    thresholds = options.thresholds.slice();
    thresholds.sort((a, b) => a - b);
  } else if (typeof options.step === 'number' && options.step > 0) {
    // fixed bin width (step) provided: compute number of bins to cover [min, max]
    const stepSize = options.step;
    let startMin = min;

    if (!options.extent) {
      startMin = Math.floor(min / stepSize) * stepSize;
    }
    thresholds = [startMin];

    while (startMin <= max) {
      startMin += stepSize;
      thresholds.push(startMin);
    }
  } else {
    // fallback to bins count (default 10)
    const bins = options.bins && options.bins > 0 ? Math.floor(options.bins) : 10;
    // If the data range is larger than 1, prefer integer thresholds when possible.
    if (max - min > 1) {
      const start = Math.floor(min);
      const stepSizeInt = Math.ceil((max - start) / bins);
      thresholds = new Array(bins + 1);
      for (let i = 0; i <= bins; i++) {
        thresholds[i] = start + stepSizeInt * i;
      }
    } else {
      const stepSize = (max - min) / bins;
      thresholds = new Array(bins + 1);
      for (let i = 0; i <= bins; i++) {
        thresholds[i] = min + stepSize * i;
      }
    }
  }

  const numBins = Math.max(0, thresholds.length - 1);
  if (numBins === 0) {
    return [];
  }

  const x0Name = options.outputNames?.x0 ?? 'x0';
  const x1Name = options.outputNames?.x1 ?? 'x1';
  const countName = options.outputNames?.count ?? 'count';
  const valuesName = options.outputNames?.values ?? 'values';
  const percentageName = options.outputNames?.percentage ?? 'percentage';

  const subViewField = isArray(options?.subViewField)
    ? options?.subViewField
    : options?.subViewField
    ? [options.subViewField]
    : [];

  const groupField = isArray(options?.groupField)
    ? options?.groupField
    : options?.groupField
    ? [options.groupField]
    : [];
  const subViewOptions = {
    ...options,
    numBins,
    thresholds,
    countName,
    percentageName,
    valuesName,
    countField,
    field,
    n,
    x0Name,
    x1Name
  };
  if (!subViewField.length) {
    return subBin(data, subViewOptions);
  }
  const subViewMap: Record<string, Array<object>> = {};
  data.forEach((dataItem: any) => {
    const subViewKey = subViewField.map(field => dataItem?.[field]).join('-&&-');
    if (!subViewMap[subViewKey]) {
      subViewMap[subViewKey] = [dataItem];
    } else {
      subViewMap[subViewKey].push(dataItem);
    }
  });
  return Object.values(subViewMap)
    .map(subDataset => {
      return subBin(subDataset, {
        ...subViewOptions,
        groupField: [...groupField, ...subViewField],
        n: subDataset.length
      });
    })
    .flat();
};

export default bin;
