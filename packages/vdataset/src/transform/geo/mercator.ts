import { project } from '../../utils/geo';
import type { Transform } from '..';

export const mercator: Transform = (data: Array<any>, options?: any) => {
  const points: Array<any> = [];
  data.forEach(item => {
    const [x, y] = project([item.lng, item.lat]);
    points.push({
      ...item,
      coordinates: [x, y]
    });
  });

  return points;
};
