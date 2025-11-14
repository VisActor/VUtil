import { clamp, isArray, isNil, quantileSorted } from '../demo-utils';
import type { Transform } from '.';

export interface IBoxplotOptions {
  /** categorical/grouping field; if omitted, the whole dataset is treated as one group */
  // single field name or array of field names to group by; if omitted, the whole dataset is treated as one group
  groupField?: string | string[];
  /** numeric field to compute boxplot stats on */
  field: string;
  /** whether to include the original values array in the output */
  includeValues?: boolean;
  /**
   * Paramater that controls whisker length.
   * If scalar, whiskers are drawn to the farthest datapoint within whis * IQR from the nearest hinge.
   * If a tuple, it is interpreted as percentiles that whiskers represent.
   */
  whiskers?: number | number[];
  /** output field name mapping */
  outputNames?: {
    key?: string;
    count?: string;
    mean?: string;
    q1?: string;
    median?: string;
    q3?: string;
    iqr?: string;
    min?: string;
    max?: string;
    lowerWhisker?: string;
    upperWhisker?: string;
    outliers?: string;
    values?: string;
  };
}

/**
 * Boxplot transform: group by a discrete field and compute statistics for numeric values.
 * Returns an array of objects, one per group, with fields: key, count, mean, q1, median, q3,
 * iqr, min (data min), max (data max), lowerWhisker, upperWhisker, outliers?, values?
 */
export const boxplot: Transform = (data: Array<object>, options?: IBoxplotOptions) => {
  const field = options?.field;
  if (!field) {
    return [];
  }

  const groupField = options?.groupField;
  let whiskers = options?.whiskers ?? 1.5;
  const includeValues = !!options?.includeValues;

  const names = options?.outputNames ?? {};
  // default key name behavior:
  // - if outputNames.key is provided, always use it
  // - else if groupField is a single string, use that field name as the key
  // - else if groupField is an array (multiple fields), we will NOT create a single key field by default;
  //   instead we will copy each group field to the output top-level (so keyName=null indicates this behavior)
  // - else (no grouping), default to 'key'
  const keyName: string | null = names.key ?? (isArray(groupField) ? null : (groupField as any) ?? 'key');
  const countName = names.count ?? 'count';
  const meanName = names.mean ?? 'mean';
  const q1Name = names.q1 ?? 'q1';
  const medianName = names.median ?? 'median';
  const q3Name = names.q3 ?? 'q3';
  const iqrName = names.iqr ?? 'iqr';
  const minName = names.min ?? 'min';
  const maxName = names.max ?? 'max';
  const lowerWhiskerName = names.lowerWhisker ?? 'lowerWhisker';
  const upperWhiskerName = names.upperWhisker ?? 'upperWhisker';
  const outliersName = names.outliers ?? 'outliers';
  const valuesName = names.values ?? 'values';

  // group values
  const groups = new Map<string, number[]>();
  const rawValues = new Map<string, any[]>();
  // map from composite key string -> representative group value (scalar for single field, object for multiple fields)
  const keyToGroup = new Map<string, any>();

  const n = data.length;
  for (let i = 0; i < n; i++) {
    const d: any = data[i] as any;
    const v: any = d[field];
    if (isNil(v)) {
      continue;
    }
    const num = +v;
    if (!Number.isFinite(num)) {
      continue;
    }

    let key: string;
    if (isArray(groupField)) {
      // build a stable composite key from multiple fields
      key = (groupField as string[]).map((f: string) => String((d as any)[f])).join('||');
    } else {
      key = groupField ? String((d as any)[groupField as string]) : '___all';
    }
    if (!groups.has(key)) {
      groups.set(key, []);
      if (includeValues) {
        rawValues.set(key, []);
      }
      // store representative group value(s) for output
      if (isArray(groupField)) {
        keyToGroup.set(key, Object.fromEntries((groupField as string[]).map(f => [f, (d as any)[f]])));
      } else {
        keyToGroup.set(key, groupField ? (d as any)[groupField as string] : null);
      }
    }
    const arr = groups.get(key);
    if (arr) {
      arr.push(num);
    }
    if (includeValues) {
      const rv = rawValues.get(key);
      if (rv) {
        rv.push(d);
      }
    }
  }

  if (isArray(whiskers)) {
    const min = clamp(Math.min.apply(null, whiskers), 0, 1);
    const max = clamp(Math.max.apply(null, whiskers), 0, 1);

    whiskers = [min, max];
  }

  const out: any[] = [];
  for (const [key, vals] of groups) {
    if (!vals || vals.length === 0) {
      continue;
    }
    const sorted = vals.slice().sort((a, b) => a - b);
    const count = sorted.length;
    const dataMin = sorted[0];
    const dataMax = sorted[sorted.length - 1];
    let sum = 0;
    for (let i = 0; i < sorted.length; i++) {
      sum += sorted[i];
    }
    const mean = sum / count;
    const q1 = quantileSorted(sorted, 0.25);
    const median = quantileSorted(sorted, 0.5);
    const q3 = quantileSorted(sorted, 0.75);
    const iqr = q3 - q1;
    const lowerBound = isArray(whiskers) ? quantileSorted(sorted, whiskers[0]) : q1 - whiskers * iqr;
    const upperBound = isArray(whiskers) ? quantileSorted(sorted, whiskers[1]) : q3 + whiskers * iqr;

    const outliers: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] < lowerBound || sorted[i] > upperBound) {
        outliers.push(sorted[i]);
      }
    }

    const obj: any = {};
    // attach the group key(s):
    // - if keyName is a string, set that property to the representative group value (scalar or object depending on settings)
    // - if keyName is null (means multi-field grouping and no explicit outputNames.key provided), copy each group field to top-level
    const representative = keyToGroup.get(key);
    if (keyName !== null) {
      obj[keyName] = representative;
    } else if (isArray(groupField)) {
      // copy each group field into the output object as top-level properties
      const groupObj = representative || {};
      for (const f of groupField as string[]) {
        obj[f] = groupObj[f];
      }
    }
    obj[countName] = count;
    obj[meanName] = mean;
    obj[q1Name] = q1;
    obj[medianName] = median;
    obj[q3Name] = q3;
    obj[iqrName] = iqr;
    obj[minName] = dataMin;
    obj[maxName] = dataMax;
    obj[lowerWhiskerName] = lowerBound;
    obj[upperWhiskerName] = upperBound;
    obj[outliersName] = outliers;
    if (includeValues) {
      obj[valuesName] = rawValues.get(key) || [];
    }

    out.push(obj);
  }

  return out;
};

export default boxplot;
