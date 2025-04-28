/**
 * text mask of wordcloud
 */
export interface TextShapeMask {
  type: 'text';
  text: string;
  hollow?: boolean;
  backgroundColor?: string;
  fill?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  fontVariant: string;
}

/**
 * text mask of wordcloud
 */
export interface GeometricMaskShape {
  type: 'geometric';
  shape: string;
  hollow?: boolean;
  backgroundColor?: string;
  fill?: string;
}

export type CanvasMaskShape = TextShapeMask | GeometricMaskShape;

export type ICreateCanvas = (options: {
  width?: number;
  // 像素高
  height?: number;
  dpr?: number;
}) => {
  width: number;
  height: number;

  setAttribute: (key: string, val: string) => void;
  getContext: (contextId: string, params?: { willReadFrequently?: boolean }) => any;
};

export type SegmentationInputType = {
  shapeUrl: string | TextShapeMask | GeometricMaskShape;
  size: [number, number];
  ratio: number;
  blur?: number;
  maskCanvas?: HTMLCanvasElement;
  tempCanvas?: HTMLCanvasElement | any;
  boardSize: [number, number];
  random: boolean;
  randomGenerator?: any;
  isEmptyPixel?: (imageData: ImageData, i: number, j: number) => boolean;
};

export type segmentationType = {
  regions: any;
  labels: number[];
  labelNumber: number;
};
export type ShapeBoundsType = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  width: number;
  height: number;
};

export interface SegmentationOutputType extends SegmentationInputType {
  segmentation: segmentationType;
  shapeBounds: ShapeBoundsType;
  shapeMaxR: number;
  shapeRatio: number;
  shapeCenter: number[];
  shapeArea: number;
}

export type CreateImageFunction = (params: { image: string }) => any;
