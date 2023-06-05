import type { IFields } from '../data-view';
import type { IFieldsMeta } from '../data-view';
import type { Transform } from '.';

type SortInfoType = {
  key: string;
  type: 'ordinal' | 'linear';
  index: number;
  sortIndex: { [key: string]: number };
  sortReverse: boolean;
  sortIndexCount: number;
};

export interface IFieldsOptions {
  fields: IFields;
}

interface IFieldsMetaTemp extends IFieldsMeta {
  _domainCache: { [key: string]: number };
  alias?: string;
}
interface IFieldsTemp extends IFields {
  [key: string]: IFieldsMetaTemp;
}

/**
 * 数据过滤
 * @param data
 * @param options
 * @returns
 */
export const fields: Transform = (data: Array<object>, options: IFieldsOptions) => {
  if (!options?.fields) {
    return data;
  }
  if (data.length === 0) {
    return data;
  }
  const fields = options.fields;
  const dataTemp = data[0];
  const filterFields: IFieldsTemp = {};
  const sortFields: SortInfoType[] = [];
  for (const key in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      const fieldInfo = fields[key] as IFieldsMetaTemp;
      if (!fieldInfo.type) {
        let dataCheck = dataTemp;
        if (!(key in dataTemp)) {
          dataCheck = data.find(d => key in d) ?? dataTemp;
        }
        fieldInfo.type = typeof dataCheck[key] === 'number' ? 'linear' : 'ordinal';
      }
      let sortInfo: SortInfoType;
      if (typeof fieldInfo.sortIndex === 'number') {
        sortInfo = {
          key,
          type: fieldInfo.type,
          index: fieldInfo.sortIndex,
          sortIndex: {},
          sortIndexCount: 0,
          sortReverse: fieldInfo.sortReverse === true
        };
        sortFields.push(sortInfo);
      }
      // if has domain & type = ordinal, make domain cache
      if (fieldInfo.domain?.length > 0) {
        if (fieldInfo.type === 'ordinal') {
          fieldInfo._domainCache = {};
          filterFields[key] = fieldInfo;
          // for sort
          const _domainCache = {};
          fieldInfo.domain.forEach((d, i) => {
            _domainCache[d] = i;
            fieldInfo._domainCache[d] = i;
          });
          if (sortInfo) {
            sortInfo.sortIndex = _domainCache;
            sortInfo.sortIndexCount = fieldInfo.domain.length;
          }
        } else if (fieldInfo.domain.length >= 2) {
          filterFields[key] = fieldInfo;
        }
      }
    }
  }
  // domain filter and sort
  const filterKeys = Object.keys(filterFields);
  if (filterKeys.length > 0) {
    data = data.filter(d => {
      for (const key in filterFields) {
        const fieldInfo = filterFields[key];
        if (fieldInfo.type === 'ordinal') {
          if (!(d[key] in fieldInfo._domainCache)) {
            return false;
          }
        } else {
          if (fieldInfo.domain[0] > d[key] || fieldInfo.domain[1] < d[key]) {
            return false;
          }
        }
      }
      return true;
    });
  }

  sortFields.sort((a, b) => a.index - b.index);

  data.sort((a, b) => sortData(a, b, sortFields));

  return data;
};

function sortData(a: object, b: object, sortFields: SortInfoType[]) {
  for (let i = 0; i < sortFields.length; i++) {
    const sortInfo = sortFields[i];
    let v = 0;
    if (sortInfo.type === 'ordinal') {
      // eslint-disable-next-line no-undefined
      if (sortInfo.sortIndex[a[sortInfo.key]] === undefined) {
        sortInfo.sortIndex[a[sortInfo.key]] = sortInfo.sortIndexCount++;
      }
      // eslint-disable-next-line no-undefined
      if (sortInfo.sortIndex[b[sortInfo.key]] === undefined) {
        sortInfo.sortIndex[b[sortInfo.key]] = sortInfo.sortIndexCount++;
      }
      v = sortInfo.sortIndex[a[sortInfo.key]] - sortInfo.sortIndex[b[sortInfo.key]];
    } else if (sortInfo.type === 'linear') {
      v = a[sortInfo.key] - b[sortInfo.key];
    }
    if (sortInfo.sortReverse) {
      v = -v;
    }
    if (v === 0) {
      continue;
    }
    return v;
  }
  return 0;
}
