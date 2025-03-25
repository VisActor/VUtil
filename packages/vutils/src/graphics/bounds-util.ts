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

export const isAABBWithinSeparation = (a: IBoundsLike, b: IBoundsLike, sep: number = 0) => {
  const s = Math.max(b.x1 - a.x2, a.x1 - b.x2, b.y1 - a.y2, a.y1 - b.y2);
  return sep > s;
};

export const isOBBWithinSeparation = (a: IOBBBounds, b: IOBBBounds, sep: number = 0) => {
  if (sep === 0) {
    return a.intersects(b);
  } else {
    const boundsA = a.getRotatedBounds();
    const boundsB = b.getRotatedBounds();
    const horizontal = Math.max(0, boundsA.x1 > boundsB.x2 ? boundsA.x1 - boundsB.x2 : boundsB.x1 - boundsA.x2);
    const vertical = Math.max(0, boundsA.y1 > boundsB.y2 ? boundsA.y1 - boundsB.y2 : boundsB.y1 - boundsA.y2);

    return sep > Math.max(horizontal, vertical);
  }
};
