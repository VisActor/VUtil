import type { Transform } from '.';

export interface IFoldOptions {
  fields: string[]; // 展开字段集
  key: string; // key字段
  value: string; // value字段
  retains?: string[]; // 保留字段集，默认为除 fields 以外的所有字段
}

/**
 *
 * @param data 数据展开
 * @param options
 * @returns
 */
export const fold: Transform = (data: Array<object>, options?: IFoldOptions) => {
  const { fields, key, value, retains } = options;
  const results: any[] = [];
  for (let i = 0; i < data.length; i++) {
    fields.forEach(field => {
      const item = {};
      item[key] = field;
      item[value] = data[i][field];
      if (retains) {
        retains.forEach(retain => {
          item[retain] = data[i][retain];
        });
      } else {
        for (const prop in data[i]) {
          if (fields.indexOf(prop) === -1) {
            item[prop] = data[i][prop];
          }
        }
      }

      results.push(item);
    });
  }
  return results;
};
