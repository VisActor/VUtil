import geoSimplify from 'simplify-geojson';
import type { FeatureCollection } from '@turf/helpers';
import { mergeDeepImmer } from '../../utils/js';
import type { Transform } from '..';

export interface ISimplifyOptions {
  tolerance?: number; // 简化容差,默认0.01
}

const DEFAULT_SIMPLIFY_OPTIONS: ISimplifyOptions = {
  tolerance: 0.01
};
/**
 * 简化
 * @param data
 * @param options
 * @returns
 */
export const simplify: Transform = (data: FeatureCollection, options?: ISimplifyOptions): FeatureCollection => {
  const mergeOptions = mergeDeepImmer(DEFAULT_SIMPLIFY_OPTIONS, options);
  const { tolerance } = mergeOptions;
  return geoSimplify(data, tolerance);
};
