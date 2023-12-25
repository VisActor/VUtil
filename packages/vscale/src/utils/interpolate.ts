import {
  isNil,
  interpolateNumber,
  interpolateDate,
  parseColorString,
  interpolateRgb,
  RGB,
  Color
} from '@visactor/vutils';

export function interpolate(a: any, b: any) {
  const t = typeof b;
  let c;

  if (isNil(b) || t === 'boolean') {
    return () => b;
  }

  if (t === 'number') {
    return interpolateNumber(a, b);
  }

  if (t === 'string') {
    if ((c = parseColorString(b))) {
      const rgb = interpolateRgb(parseColorString(a as string), c);

      return (t: number) => {
        // #rrggbbaa 格式在部分浏览器存在兼容性问题，rgba()字符串兼容性更好，所以还是支持rgba()字符串
        return rgb(t).formatRgb();
      };
    }

    return interpolateNumber(Number(a), Number(b));
  }

  if (b instanceof RGB) {
    return interpolateRgb(a, b);
  }

  if (b instanceof Color) {
    return interpolateRgb(a.color, b.color);
  }

  if (b instanceof Date) {
    return interpolateDate(a, b);
  }

  return interpolateNumber(Number(a), Number(b));
}
