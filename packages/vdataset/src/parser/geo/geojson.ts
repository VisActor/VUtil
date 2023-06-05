import { geoPath } from 'd3-geo';
import { DATAVIEW_TYPE } from '../../constants';
import type { DataView } from '../../data-view';
import type { Parser } from '..';
import { mergeDeepImmer } from '../../utils/js';
import trufRewind from '@turf/rewind';
import flatten from '@turf/flatten';

const geoPathInstance = geoPath();
export interface IGeoJSONOptions {
  centroid?: boolean;
  name?: boolean;
  bbox?: boolean;
  rewind?: boolean;
}

export const DEFAULT_GEOJSON_OPTIONS = {
  centroid: false,
  name: false,
  bbox: false,
  rewind: false
};
export const MultiToSingle = (feature: any) => {
  if (feature.geometry.type.startsWith('Multi')) {
    const f = flatten(feature).features[0];
    return { ...f, ...f.properties };
  }
  return { ...feature, ...feature.properties };
};
export const flattenFeature = (data: any[]) => {
  const featuresArr: any[] = [];
  data.forEach((item: any) => {
    if (item.type === 'FeatureCollection') {
      // featureCollection
      item.features.forEach((feature: any) => {
        featuresArr.push(MultiToSingle(feature));
      });
    } else {
      // feature
      featuresArr.push(MultiToSingle(item));
    }
  });
  return featuresArr;
};

/**
 * 解析geojson
 * @param data
 * @param _options
 * @param dataView
 * @returns
 */
export const geoJSONParser: Parser = (data: any, options: IGeoJSONOptions = {}, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.GEO;

  const mergeOptions = mergeDeepImmer(DEFAULT_GEOJSON_OPTIONS, options);

  const { centroid, name, bbox, rewind } = mergeOptions;
  if (Array.isArray(data)) {
    return flattenFeature(data);
  }
  let features: any[] = data.features;
  if (rewind) {
    features = trufRewind(data).features;
  }
  features.forEach(feature => {
    if (centroid) {
      const centroid = geoPathInstance.centroid(feature);
      feature.centroidX = centroid[0];
      feature.centroidY = centroid[1];
    }

    if (name) {
      feature.name = feature.properties.name;
    }

    if (bbox) {
      const bbox = geoPathInstance.bounds(feature);
      feature.bbox = bbox;
    }
  });

  data.features = features;
  return data;
};
