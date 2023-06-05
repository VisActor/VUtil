import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { isString } from '@visactor/vutils';
import { DATAVIEW_TYPE } from '../../constants';
import type { DataView } from '../../data-view';
import type { Parser } from '..';
import { mergeDeepImmer } from '../../utils/js';
import type { IGeoJSONOptions } from './geojson';
import { DEFAULT_GEOJSON_OPTIONS, geoJSONParser } from './geojson';

export interface ITopoJsonParserOptions extends IGeoJSONOptions {
  object: string; // TopoJSON 相当于多个 GeoJSON 合并起来做了压缩，其中每一个 object 都相当于一份 GeoJSON 数据，指定 object 就是从中提取一份 Geo 数据
}

const DEFAULT_TOPOJSON_OPTIONS = {};
/**s
 * topojson 数据解析
 * @param data
 * @param options
 * @param dataView
 * @returns
 */
export const topoJSONParser: Parser = (data: Topology, options: ITopoJsonParserOptions, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.GEO;
  const mergeOptions = mergeDeepImmer(DEFAULT_GEOJSON_OPTIONS, DEFAULT_TOPOJSON_OPTIONS, options);
  const { object } = mergeOptions;
  if (!isString(object)) {
    throw new TypeError('Invalid object: must be a string!');
  }
  const geoData = feature(data, data.objects[object]);
  return geoJSONParser(geoData, mergeOptions, dataView);
};
