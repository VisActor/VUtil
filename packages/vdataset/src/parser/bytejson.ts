import type { DataView } from '../data-view';
import { DATAVIEW_TYPE } from '../constants';

export const byteJSONParser = (data: any[], options: any, dataView: DataView) => {
  dataView.type = DATAVIEW_TYPE.BYTE;
  const result: any[] = [];
  const { layerType } = options;
  data.forEach((item: any) => {
    let lType = layerType;
    let coord = [];
    // 飞线
    if (item.from) {
      lType = 'FlyLine';
      coord = [item.from, item.to];
    }

    // 点
    if (item.lng) {
      lType = 'Point';
      coord = [item.lng, item.lat];
    }

    if (item.coordinates) {
      // 通过嵌套层级判断 MultiLine/Line
      const suffix = lType === 'Line' ? 'LineString' : 'Polygon';
      lType = Array.isArray(item.coordinates[0][0]) ? `Multi${suffix}` : suffix;
      coord = item.coordinates;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { coordinates, ...others } = item;
    const dataItem = {
      ...others,
      geometry: {
        type: lType,
        coordinates: coord
      }
    };
    result.push(dataItem);
  });
  return result;
};
