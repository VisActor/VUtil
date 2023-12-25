import { Color, RGB } from '@visactor/vutils';
export interface IColorRGBObj {
  r: number;
  g: number;
  b: number;
}

export interface IColorRGBAObj extends IColorRGBObj {
  a: number;
}

/**
 * 根据值生成线性颜色（升序）, 修改data 插入 colorObj 字段
 * @param startColor
 * @param endColor
 * @param total
 */
export function colorLinearGenerator(startColor: string, endColor: string, data: Array<any>, field: string) {
  // 未传入 startColor ， 即range = [] , 则返回原数据，颜色取defaultColor
  if (!startColor) {
    console.warn(`Warn: 颜色 range 未传入 startColor`);
    return;
  }
  // 未传入 endColor ，则全部采用startColor
  if (!endColor) {
    const colorObj = ColorObjGenerator(startColor);
    data.forEach((item, index) => {
      item.colorObj = colorObj;
    });
    return;
  }

  const { color: startColorObj, opacity: startOpacity } = ColorObjGenerator(startColor);
  const { r: startR, g: startG, b: startB } = startColorObj.color;
  const { color: endColorObj, opacity: endOpacity } = ColorObjGenerator(endColor);
  const { r: endR, g: endG, b: endB } = endColorObj.color;

  const dR = endR - startR;
  const dG = endG - startG;
  const dB = endB - startB;
  const dA = endOpacity - startOpacity;
  const total = data.length;
  if (total === 0) {
    // 如果 数据传入空数组[]，则返回原数据，颜色取defaultColor
    return;
  }
  if (total === 1) {
    data[0].colorObj = {
      color: new Color(new RGB(startR, startG, startB).toString()),
      transparent: true,
      opacity: startOpacity
    };
    return;
  } else if (total === 2) {
    data[0].colorObj = {
      color: new Color(new RGB(startR, startG, startB).toString()),
      transparent: true,
      opacity: startOpacity
    };
    data[1].colorObj = {
      color: new Color(new RGB(endR, endG, endB).toString()),
      transparent: true,
      opacity: endOpacity
    };
    return;
  }
  const dValue = data[total - 1][field] - data[0][field];

  data.forEach((item, index) => {
    const step = dValue === 0 ? 0 : (item[field] - data[0][field]) / dValue;

    const color = `rgba(${Math.floor((startR + dR * step) * 255)},${Math.floor(
      (startG + dG * step) * 255
    )},${Math.floor((startB + dB * step) * 255)}, ${startOpacity + dA * step})`;
    const colorObj = ColorObjGenerator(color);
    item.colorObj = colorObj;
  });

  return;
}

/**
 * 根据值分布生成离散颜色（升序）
 * @param startColor
 * @param endColor
 * @param total
 */
export function colorOrdinalGenerator(colorRange: Array<string>, data: Array<any>) {
  //  range = [] , 则返回原数据，颜色取defaultColor
  if (colorRange.length === 0) {
    console.warn(`Warn: 颜色 range 未传入 `);
    return;
  }
  const step = data.length / colorRange.length;
  const __processColorObjRange = colorRange.map(color => {
    return ColorObjGenerator(color);
  });
  data.forEach((item, index) => {
    const colorObj = __processColorObjRange[Math.ceil(index / step) - 1];
    item.colorObj = colorObj;
  });
}

/**
 * 颜色构造器
 * ! 因为Color不支持rgba解析，所以包一层hack实现
 * @param color
 */
export function ColorObjGenerator(color: string): IColorObjGenerator {
  const reg = /^(rgba|RGBA)/;
  let rgbaColor;
  if (reg.test(color)) {
    rgbaColor = rgbaStr2RgbaObj(color);
  }

  return {
    color: new Color(color),
    transparent: !!rgbaColor,
    opacity: rgbaColor ? rgbaColor.a : 1 // alpha 没有的话 默认为1
  };
}

export interface IColorObjGenerator {
  color: Color;
  transparent: boolean;
  opacity: number;
}

/**
 * rgba 字符串转对象
 * 将'rgba(255,255,255,1)' 改为 {r:255, g:255, b:255,a:1}
 * @param color
 */
export function rgbaStr2RgbaObj(color: string): IColorRGBAObj {
  // 把RGB的3个数值变成数组
  const colorArr = color.replace(/(?:\(|\)|rgba|RGBA)*/g, '').split(',');

  return {
    r: Number(colorArr[0]),
    g: Number(colorArr[1]),
    b: Number(colorArr[2]),
    a: Number(colorArr[3])
  };
}
