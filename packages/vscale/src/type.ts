export enum ScaleEnum {
  // identity scale
  Identity = 'identity',

  // continuous scales
  Linear = 'linear',
  // LinearFactory = 'linearfactory',
  Log = 'log',
  Pow = 'pow',
  Sqrt = 'sqrt',
  Symlog = 'symlog',
  Time = 'time',
  // UTC = 'utc',

  // sequential scales
  // Sequential = 'sequential',
  // Diverging = 'diverging',

  // discretizing scales
  Quantile = 'quantile',
  Quantize = 'quantize',
  Threshold = 'threshold',

  // discrete scales
  Ordinal = 'ordinal',
  Point = 'point',
  Band = 'band'
  // BinOrdinal = 'bin-ordinal',
}

const EnableScaleMap = {};
Object.values(ScaleEnum).forEach(v => {
  EnableScaleMap[v] = true;
});

export function isContinuous(type: string) {
  switch (type) {
    case ScaleEnum.Linear:
    case ScaleEnum.Log:
    case ScaleEnum.Pow:
    case ScaleEnum.Sqrt:
    case ScaleEnum.Symlog:
    case ScaleEnum.Time:
      return true;
    default:
      return false;
  }
}

export function isValidScaleType(type: string) {
  return !!EnableScaleMap[type];
}

export function isDiscrete(type: string) {
  switch (type) {
    case ScaleEnum.Ordinal:
    case ScaleEnum.Point:
    case ScaleEnum.Band:
      return true;
    default:
      return false;
  }
}

export function isDiscretizing(type: string) {
  switch (type) {
    case ScaleEnum.Quantile:
    case ScaleEnum.Quantize:
    case ScaleEnum.Threshold:
      return true;
    default:
      return false;
  }
}
export function supportRangeFactor(type: string) {
  switch (type) {
    case ScaleEnum.Linear:
    case ScaleEnum.Log:
    case ScaleEnum.Pow:
    case ScaleEnum.Sqrt:
    case ScaleEnum.Symlog:
    case ScaleEnum.Time:
    case ScaleEnum.Band:
    case ScaleEnum.Point:
      return true;
    default:
      return false;
  }
}
