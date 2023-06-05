/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Morgan Herlocker
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in allcopies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import type { Feature, MultiPolygon, Polygon, Units } from './interface';
import { lengthToRadians } from '@turf/helpers';
import { pointInRect, polygonContainPoint } from '../graphics';
import type { IPointLike } from '../data-structure';
import { degreeToRadian, radianToDegree } from '../angle';

// https://github.com/Turfjs/turf
function getGeom(geojson: any): any {
  if (geojson.type === 'Feature') {
    return geojson.geometry;
  }
  return geojson;
}

export function isPointInPolygon<G extends Polygon | MultiPolygon>(point: IPointLike, polygon: Feature<G> | G) {
  if (!point) {
    return false;
  }

  if (!polygon) {
    return false;
  }

  const geom = getGeom(polygon);
  const type = geom.type;
  //  BBox [west, south, east, north]
  const bbox = polygon.bbox;
  let polys: any[] = geom.coordinates;

  if (bbox && pointInRect(point, { x1: bbox[0], x2: bbox[1], y1: bbox[1], y2: bbox[3] }, true) === true) {
    return false;
  }

  if (type === 'Polygon') {
    polys = [polys];
  }
  let result = false;

  for (let i = 0; i < polys.length; ++i) {
    for (let j = 0; j < polys[i].length; ++j) {
      const polyResult = polygonContainPoint(
        polys[i][j].map((p: number[]) => ({ x: p[0], y: p[1] })),
        point.x,
        point.y
      );
      if (polyResult) {
        result = true;
        return result;
      }
    }
  }

  return result;
}

// https://github.com/Turfjs/turf
export function destination(
  point: IPointLike,
  distance: number,
  bearing: number,
  options: {
    units?: Units;
  } = {}
) {
  const longitude1 = degreeToRadian(point[0]);
  const latitude1 = degreeToRadian(point[1]);
  const bearingRad = degreeToRadian(bearing);
  const radians = lengthToRadians(distance, options.units);

  // Main
  const latitude2 = Math.asin(
    Math.sin(latitude1) * Math.cos(radians) + Math.cos(latitude1) * Math.sin(radians) * Math.cos(bearingRad)
  );
  const longitude2 =
    longitude1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(radians) * Math.cos(latitude1),
      Math.cos(radians) - Math.sin(latitude1) * Math.sin(latitude2)
    );
  const lng = radianToDegree(longitude2);
  const lat = radianToDegree(latitude2);

  return { x: lng, y: lat };
}
