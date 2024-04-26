import type { IBoundsLike } from '../data-structure';

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
