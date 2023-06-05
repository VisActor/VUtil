import { Color } from './color';
export interface IColorRGBObj {
  r: number;
  g: number;
  b: number;
}

export interface IColorRGBAObj extends IColorRGBObj {
  a: number;
}

/**
 * 支持解析颜色类型
 * 16 进制: '#ff0000'
 * rgb : 'rgb(255,0,0)'
 * x11 color: 'red'
 * hsl: 'hsl(0, 100%, 50%)'
 */
export type ColorType = string;

export type ColorRGBAStr = string; // 'rgba(r,g,b,a)'

/**
 * 根据值生成线性颜色（升序）, 修改data 插入 colorObj 字段
 * @param startColor
 * @param endColor
 * @param total
 */
export function colorLinearGenerator(startColor: ColorType, endColor: ColorType, data: Array<any>, field: string) {
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

  const {
    color: { r: startR, g: startG, b: startB },
    opacity: startOpacity
  } = ColorObjGenerator(startColor);

  const {
    color: { r: endR, g: endG, b: endB },
    opacity: endOpacity
  } = ColorObjGenerator(endColor);

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
      color: new Color(startR, startG, startB),
      transparent: true,
      opacity: startOpacity
    };
    return;
  } else if (total === 2) {
    data[0].colorObj = {
      color: new Color(startR, startG, startB),
      transparent: true,
      opacity: startOpacity
    };
    data[1].colorObj = {
      color: new Color(endR, endG, endB),
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
export function colorOrdinalGenerator(colorRange: Array<ColorType>, data: Array<any>) {
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

// ! 颜色转换 废弃，内置 engine Color支持 绝大数场景
// ! Color不支持alpha分量，所以将其忽略，但是会读取颜色分量。（通过ColorObjGenerator实现）
// mentioned: https://github.com/mrdoob/three.js/issues/6014
// empty constructor - will default white
// const color1 = new THREE.Color();

// Hexadecimal color (recommended)
// const color2 = new THREE.Color( 0xff0000 );

// RGB string
// const color3 = new THREE.Color("rgb(255, 0, 0)");
// const color4 = new THREE.Color("rgb(100%, 0%, 0%)");

// X11 color name - all 140 color names are supported.
// Note the lack of CamelCase in the name
// const color5 = new THREE.Color( 'skyblue' );

// HSL string
// const color6 = new THREE.Color("hsl(0, 100%, 50%)");

// Separate RGB data between 0 and 1
// const color7 = new THREE.Color( 1, 0, 0 );

/**
 * rgb 转 hex
 * @param color
 * @param hexType
 */
export function rgb2Hex(color: string | IColorRGBObj, hexType: 'number' | 'string' = 'string') {
  let hex;
  // rgb对象，{r:0,g:0,b:0}
  if (color instanceof Object) {
    switch (hexType) {
      case 'number':
        // ? todo怎么计算
        hex = parseInt(((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1), 16);
        break;
      case 'string':
        hex = '#' + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
        break;
    }
    return hex;
  }
  // rgb字符串,"rgb(255,255,255)".
  // RGB颜色值的正则
  const reg = /^(rgb|RGB)/;
  if (reg.test(color)) {
    let strHex = '#';
    // 把RGB的3个数值变成数组
    const colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
    // 转成16进制
    for (let i = 0; i < colorArr.length; i++) {
      let hex = Number(colorArr[i]).toString(16);
      if (hex === '0') {
        hex += hex;
      }
      strHex += hex;
    }
    return strHex;
  }
  return String(color);
}

/**
 * hex 转 rgb
 * "#fff" => rgb(255,255,255)
"#ffffff" => rgb(255,255,255)
 * @param color
 */
export function hex2RGB(color: string) {
  // 16进制颜色值的正则
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  // 把颜色值变成小写
  color = color.toLowerCase();
  if (reg.test(color)) {
    // 如果只有三位的值，需变成六位，如：#fff => #ffffff
    if (color.length === 4) {
      let colorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
      }
      color = colorNew;
    }
    // 处理六位的颜色值，转为RGB
    const colorChange = [];
    for (let i = 1; i < 7; i += 2) {
      colorChange.push(parseInt('0x' + color.slice(i, i + 2), 10));
    }
    return 'RGB(' + colorChange.join(',') + ')';
  }
  return color;
}

/**
 * rgb 字符串转对象
 * 将'rgb(255,255,255)' 改为 {r:255, g:255, b:255}
 * @param color
 */
export function rgbStr2RgbObj(color: string): IColorRGBObj {
  // 把RGB的3个数值变成数组
  const colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');

  return {
    r: Number(colorArr[0]),
    g: Number(colorArr[1]),
    b: Number(colorArr[2])
  };
}

/**
 * rgba 字符串转对象
 * 将'rgba(255,255,255,1)' 改为 {r:255, g:255, b:255,a:1}
 * @param color
 */
export function rgbaStr2RgbaObj(color: ColorRGBAStr): IColorRGBAObj {
  // 把RGB的3个数值变成数组
  const colorArr = color.replace(/(?:\(|\)|rgba|RGBA)*/g, '').split(',');

  return {
    r: Number(colorArr[0]),
    g: Number(colorArr[1]),
    b: Number(colorArr[2]),
    a: Number(colorArr[3])
  };
}

/**
 * 计算材质 透明度
 * ! 优先使用 color的alpha通道
 */
export function calcMaterialOpacity(color: IColorObjGenerator, extraOpacity: number) {
  return color.transparent ? color.opacity : extraOpacity;
}
