import type { DataView } from '../data-view';
import type { Parser } from '.';
import { isBoolean, isArray } from '@dp/vis-util';

export interface IDataViewParserOptions {
  dependencyUpdate?: boolean; // 是否依赖更新
}

/**
 * dataView数据 解析器
 * @param data
 * @param options
 * @param dataView
 * @returns
 */
export const dataViewParser: Parser = (data: DataView[], options: IDataViewParserOptions, dataView: DataView) => {
  const dependencyUpdate = isBoolean(options?.dependencyUpdate) ? options?.dependencyUpdate : true;

  if (!data || !isArray(data)) {
    throw new TypeError('Invalid data: must be DataView array!');
  }
  if (isArray(dataView.rawData)) {
    (<DataView[]>dataView.rawData).forEach(rd => {
      if (rd.target) {
        rd.target.removeListener('change', dataView.reRunAllTransform);
        rd.target.removeListener('markRunning', dataView.markRunning);
      }
    });
  }

  if (dependencyUpdate) {
    data.forEach(d => {
      d.target.addListener('change', dataView.reRunAllTransform);
      d.target.addListener('markRunning', dataView.markRunning);
    });
  }
  return data;
};
