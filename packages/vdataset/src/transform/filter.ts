import type { Transform } from '.';

export interface IFilterOptions {
  callback?: (item: any) => boolean;
}

/**
 * 数据过滤
 * @param data
 * @param options
 * @returns
 */
export const filter: Transform = (data: Array<object>, options?: IFilterOptions) => {
  const { callback } = options;
  if (callback) {
    data = data.filter(callback);
  }
  return data;
};
