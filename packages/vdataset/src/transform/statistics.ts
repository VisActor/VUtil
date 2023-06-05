import * as simpleStatistics from 'simple-statistics';
import { mergeDeepImmer } from '../utils/js';
import { isArray, uniqArray, flattenArray } from '@visactor/vutils';
import { STATISTICS_METHODS } from '../constants';
import type { Transform } from '.';

export interface IStatisticsOptions {
  fields: string[];
  operations: Array<
    | 'count'
    | 'max'
    | 'min'
    | 'mean'
    | 'average'
    | 'median'
    | 'mode'
    | 'product'
    | 'standardDeviation'
    | 'sum'
    | 'sumSimple'
    | 'variance'
  >;
  as?: string[];
  groupBy?: string;
}

const DEFAULT_STATISTICS_OPTIONS: IStatisticsOptions = {
  as: [],
  fields: [],
  groupBy: null,
  operations: ['count', 'max', 'min', 'average', 'sum']
};

const aggregates: any = {
  count(data: any[]) {
    return data.length;
  },
  distinct(data: any[], field: string) {
    const values = uniqArray(data.map(row => row[field]));
    return values.length;
  }
};

STATISTICS_METHODS.forEach(method => {
  aggregates[method] = (data: any[], field: string) => {
    let values = data.map(row => row[field]);
    if (isArray(values) && isArray(values[0])) {
      values = flattenArray(values);
    }
    // @ts-ignore
    return simpleStatistics[method](values);
  };
});
aggregates.average = aggregates.mean;

/**
 * 聚合统计主要用于处理数据(诸如统计平均值,求和等),并返回计算后的数据结果
 * @param data
 * @param options
 * @returns
 */
export const statistics: Transform = (data: Array<object>, options?: IStatisticsOptions) => {
  const mergeOptions = mergeDeepImmer(DEFAULT_STATISTICS_OPTIONS, options) as IStatisticsOptions;
  const { as, fields, groupBy, operations } = mergeOptions;

  // 分组
  const groups: { [key: string]: Array<object> } = {};
  data.forEach(d => {
    groups[d[groupBy]] = groups[d[groupBy]] || [];
    groups[d[groupBy]].push(d);
  });

  const results: any[] = [];
  for (const key in groups) {
    const result = {
      group: key
    };
    const group = groups[key];
    operations.forEach((operation, i) => {
      const outputName = as[i] ?? operation;
      const field = fields[i] ?? fields[0];
      result[outputName] = aggregates[operation](group, field);
    });
    results.push(result);
  }

  return results;
};
