import { project } from '../../utils/geo';
import type { Transform } from '..';

const PROJECTION_GROUP = {
  webmercator: project
};

export interface IProjectionOptions {
  projection: string;
  as: string;
}

export const projection: Transform = (data: any, options?: IProjectionOptions) => {
  if (!data || data.length === 0) {
    return data;
  }
  const { projection, as } = options;
  const prjFunc = PROJECTION_GROUP[projection];
  if (data[0].lng) {
    const processData = data.map((item: { lng: any; lat: any }) => {
      return {
        ...item,
        [as]: prjFunc([item.lng, item.lat])
      };
    });
    return processData;
  }
  const result = data.map((ele: any) => {
    const { coordinates } = ele.geometry || {};
    if (!Array.isArray(coordinates[0])) {
      const processData = prjFunc(coordinates);
      return {
        ...ele,
        [as]: processData
      };
    }
    const processData = coordinates.map((item: Array<any>) => {
      return Array.isArray(item[0]) ? item.map((coord: number[]) => prjFunc(coord)) : prjFunc(item);
    });
    return {
      ...ele,
      [as]: processData,
      geometry: {
        ...ele.geometry,
        [as]: processData
      }
    };
  });
  return result;
};
