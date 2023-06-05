import type { Transform } from '.';

export interface IMapOptions {
  callback?: (item: any, index: number, arr: any[]) => any;
}

/**
 *
 * @param data 数据加工
 * @param options
 * @returns
 */
export const map: Transform = (data: Array<object>, options?: IMapOptions) => {
  const { callback } = options;
  if (callback) {
    data = data.map(callback);
  }
  return data;
};
