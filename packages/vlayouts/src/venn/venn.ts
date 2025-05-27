import type { IPointLike } from '@visactor/vutils';
import { array, has, isEmpty } from '@visactor/vutils';
import type {
  IVennCircleDatum,
  IVennCommonDatum,
  IVennOverlapDatum,
  IVennTransformMarkOptions,
  IVennTransformOptions
} from './interface';
import { computeTextCenters, normalizeSolution, scaleSolution, venn } from './utils';
import type { VennCircleName, IVennArea, IVennCircle, VennAreaName } from './utils/interface';
import { getArcsFromCircles, getPathFromArcs } from './utils/path';

export const transform = (
  options: IVennTransformOptions,
  upstreamData: any[]
): Array<IVennCircleDatum | IVennOverlapDatum> => {
  const {
    x0,
    x1,
    y0,
    y1,
    setField = 'sets',
    valueField = 'size',
    orientation = Math.PI / 2,
    orientationOrder = null,
    emptySetKey = 'rest'
  } = options;
  let circles: Record<VennCircleName, IVennCircle> = {};
  let textCenters: Record<VennAreaName, IPointLike> = {};

  let hasEmptySet = false;
  hasEmptySet = upstreamData.some(area => {
    const sets = array(area[setField]);
    return !sets || sets.length === 0;
  });

  const nonEmptyUpstreamData = hasEmptySet
    ? upstreamData.filter(area => {
        const sets = array(area[setField]);
        return !isEmpty(sets);
      })
    : upstreamData;

  if (nonEmptyUpstreamData.length > 0) {
    const vennData = nonEmptyUpstreamData.map(
      area =>
        ({
          sets: array(area[setField]),
          size: area[valueField]
        } as IVennArea)
    );
    let solution = venn(vennData, options);
    solution = normalizeSolution(solution, orientation, orientationOrder);
    circles = scaleSolution(solution, x1 - x0, y1 - y0, x0, y0, hasEmptySet);
    textCenters = computeTextCenters(circles, vennData);
  }

  const data = upstreamData.map(area => {
    const sets = array(area[setField]);
    if (!sets || sets.length === 0) {
      return {
        ...area,
        datum: area,
        sets,
        key: emptySetKey,
        size: area[valueField],
        labelX: undefined,
        labelY: undefined,
        type: 'circle',
        x: x0 + (x1 - x0) / 2,
        y: y0 + (y1 - y0) / 2,
        radius: Math.min(x1 - x0, y1 - y0) / 2
      } as IVennCircleDatum;
    }
    const key = sets.toString();
    const textCenter = textCenters[key];
    const basicDatum = {
      ...area,
      datum: area,
      sets,
      key,
      size: area[valueField],
      labelX: textCenter?.x,
      labelY: textCenter?.y
    } as IVennCommonDatum;
    const circle = circles[key];
    if (circle) {
      return {
        ...basicDatum,
        type: 'circle',
        x: circle.x,
        y: circle.y,
        radius: circle.radius
      } as IVennCircleDatum;
    }
    const arcs = getArcsFromCircles(sets.map(name => circles[name]));
    return {
      ...basicDatum,
      type: 'overlap',
      x: 0,
      y: 0,
      path: getPathFromArcs(arcs),
      arcs
    } as IVennOverlapDatum;
  });
  return data;
};

export const transformMark = (
  options: IVennTransformMarkOptions,
  upstreamData: Array<IVennCircleDatum | IVennOverlapDatum>
) => {
  return upstreamData.filter(datum => datum.type === options.datumType);
};
