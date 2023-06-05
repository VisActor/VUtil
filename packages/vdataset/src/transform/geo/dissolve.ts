import type { FeatureCollection, MultiPolygon, Polygon } from '@turf/helpers';
import geoDissolve from 'geojson-dissolve';
import type { Transform } from '..';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDissolveOptions {}

/**
 * 计算边界
 * @param data
 * @param options
 * @returns Polygon | MultiPolygon
 */
export const dissolve: Transform = (data: FeatureCollection, options?: IDissolveOptions): Polygon | MultiPolygon => {
  return geoDissolve(data);
};
