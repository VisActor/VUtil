import type { IBoundsLike, IOBBBounds } from '../data-structure';

export type InsideBoundsAnchorType = 'inside' | 'inside-top' | 'inside-bottom' | 'inside-left' | 'inside-right';

export type BoundsAnchorType =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

export const calculateAnchorOfBounds = (bounds: IBoundsLike, anchorType: string) => {
  const { x1, x2, y1, y2 } = bounds;
  const rectWidth = Math.abs(x2 - x1);
  const rectHeight = Math.abs(y2 - y1);
  let anchorX = (x1 + x2) / 2;
  let anchorY = (y1 + y2) / 2;

  let sx = 0;
  let sy = 0;

  switch (anchorType) {
    case 'top':
    case 'inside-top':
      sy = -0.5;
      break;
    case 'bottom':
    case 'inside-bottom':
      sy = 0.5;
      break;
    case 'left':
    case 'inside-left':
      sx = -0.5;
      break;
    case 'right':
    case 'inside-right':
      sx = 0.5;
      break;
    case 'top-right':
      sx = 0.5;
      sy = -0.5;
      break;
    case 'top-left':
      sx = -0.5;
      sy = -0.5;
      break;
    case 'bottom-right':
      sx = 0.5;
      sy = 0.5;
      break;
    case 'bottom-left':
      sx = -0.5;
      sy = 0.5;
  }

  anchorX += sx * rectWidth;
  anchorY += sy * rectHeight;

  return { x: anchorX, y: anchorY };
};

export const aabbSeparation = (a: IBoundsLike, b: IBoundsLike) => {
  return Math.max(b.x1 - a.x2, a.x1 - b.x2, b.y1 - a.y2, a.y1 - b.y2);
};

export const obbSeparation = (a: IOBBBounds, b: IOBBBounds) => {
  const axes = [
    { x: Math.cos(a.angle), y: Math.sin(a.angle) }, // Rect A's first axis
    { x: -Math.sin(a.angle), y: Math.cos(a.angle) }, // Rect A's second axis
    { x: Math.cos(b.angle), y: Math.sin(a.angle) }, // Rect B's first axis
    { x: -Math.sin(b.angle), y: Math.cos(a.angle) } // Rect B's second axis
  ];

  // calculate the projection range of a rectangle on a given axis
  function getProjectionRange(obb: IOBBBounds, axisX: number, axisY: number): { min: number; max: number } {
    const corners = obb.getRotatedCorners();
    const projections = corners.map(p => p.x * axisX + p.y * axisY);
    return { min: Math.min(...projections), max: Math.max(...projections) };
  }

  // Calculate distances for all axes
  let maxDistance = 0;
  for (const axis of axes) {
    const rangeA = getProjectionRange(a, axis.x, axis.y);
    const rangeB = getProjectionRange(b, axis.x, axis.y);
    let distance;
    if (rangeA.max < rangeB.min) {
      distance = rangeB.min - rangeA.max; // B is to the right of A
    } else if (rangeB.max < rangeA.min) {
      distance = rangeA.min - rangeB.max; // A is to the right of B
    } else {
      distance = 0; // Overlapping
    }
    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance;
};
