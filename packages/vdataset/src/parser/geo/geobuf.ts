import geobuf from 'geobuf';
import Pbf from 'pbf';
import { DATAVIEW_TYPE } from '../../constants';
import type { DataView } from '../../data-view';
import { mergeDeepImmer } from '../../utils/js';
import type { Parser } from '..';
import type { IGeoJSONOptions } from './geojson';
import { DEFAULT_GEOJSON_OPTIONS, geoJSONParser } from './geojson';

export type IGeoBufOptions = IGeoJSONOptions;

const DEFAULT_GEOBUF_OPTIONS = {};
/**
 * geobuf pbf 解码为 geojson
 * @param data
 * @returns
 */
export const geoBufParser: Parser = (data: ArrayBuffer, options: IGeoBufOptions = {}, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.GEO;
  const mergeOptions = mergeDeepImmer(DEFAULT_GEOJSON_OPTIONS, DEFAULT_GEOBUF_OPTIONS, options);
  const geoData = geobuf.decode(new Pbf(data)); // 对GeoBuf解码
  return geoJSONParser(geoData, mergeOptions, dataView);
};
