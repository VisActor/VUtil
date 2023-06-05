import { hexbin } from 'd3-hexbin';
import { colorLinearGenerator } from '../utils/color';
import type { Transform } from '.';

// 根据六边形中心点生成position、indexes、colors
const point_hex_corner = (centerPoints: Array<any>, size: number, z: number, angle: number = 0) => {
  const position: Array<number> = [];
  const colors: Array<number> = [];
  // const position = [center.x, center.y, 0];
  let init_indexes = [0, 1, 2, 2, 3, 4, 4, 5, 0, 0, 2, 4];
  const last_indexes: Array<number> = [];
  const offset: Array<number> = [];
  centerPoints.forEach((center, index) => {
    const offetX = center.hexCenterCoord[0] - centerPoints[0].hexCenterCoord[0];
    const offetY = center.hexCenterCoord[1] - centerPoints[0].hexCenterCoord[1];
    offset.push(offetX, offetY, z);
    // 通过中心点生成六边形顶点
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i - 30 + angle;
      const angle_rad = (Math.PI / 180) * angle_deg;
      position.push(
        center.hexCenterCoord[0] + size * Math.cos(angle_rad),
        center.hexCenterCoord[1] + size * Math.sin(angle_rad),
        z
      );
    }
    if (index === 0) {
      // const r = earcut(hex_points, null, 3);
      last_indexes.push(...init_indexes);
    } else {
      init_indexes = init_indexes.map(item => item + 6);
      last_indexes.push(...init_indexes);
    }
    const { color, opacity } = center.colorObj;
    const arrColor = [color.r, color.g, color.b, opacity];
    colors.push(...arrColor);
  });
  return {
    position,
    indexes: last_indexes,
    centerPoints: [...centerPoints[0].hexCenterCoord, z],
    colors,
    offset
  };
};

export interface IHexagonData {
  position: number[];
  indexes: number[];
  centerPoints: number[];
  colors: number[];
  offset: number[];
}
export interface IHexagonOptions {
  padding?: number; // 六边形之间的留白
  size?: number; // 六边形的大小
  calcMethod?: string; //将点数据的 value 提取到六边形进行计算的方法
  field?: string; // 使用哪一个字段作为热力大小的参考
  angle?: number;
  colorConfig?: {
    type?: 'ordinal' | 'linear'; // 离散 / 线性 , 默认为 'linear'
    range: Array<string>;
    field?: string; // 选择某个 data 的key 作为 维度字段，默认为 'value'
    default?: string; // 默认为白色
    opacity?: number; // 蜂窝热力图 透明度
  };
}
export const pointToHexbin: Transform = (data: [number, number][], options?: IHexagonOptions): IHexagonData => {
  const { size = 10, angle = 0, calcMethod = 'sum', padding = 0, field = 'value', colorConfig } = options;
  if (data.length === 0) {
    return null;
  }
  const { type, field: colorField, range } = colorConfig;
  const transformHexbin = hexbin()
    .radius(size)
    // @ts-ignore
    .x(c => c.coordinates[0])
    // @ts-ignore
    .y(c => c.coordinates[1]);

  // 聚合后的六边形中心点坐标
  const centerPoints = transformHexbin(data).map((hex: any, index: number) => {
    const calcFields = hex.map((item: any) => item[field]);
    const calcValue = calcFields.reduce((acc: number, curr: number) => acc + curr);
    return {
      _id: index,
      hexCenterCoord: [hex.x, hex.y],
      rawData: hex,
      count: hex.length,
      [field]: calcValue
    };
  });
  centerPoints.sort((a: any, b: any) => {
    return a[field] - b[field];
  });
  colorLinearGenerator(range[0], range[1], centerPoints, field);
  const hex = point_hex_corner(centerPoints, size - padding, 0, angle);
  return hex;
};
