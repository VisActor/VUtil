import type { IPointLike } from './data-structure';

export function getContainerSize(el: HTMLElement | null, defaultWidth: number = 0, defaultHeight: number = 0) {
  if (!el) {
    return { width: defaultWidth, height: defaultHeight };
  }

  let getComputedStyle;
  try {
    getComputedStyle = window?.getComputedStyle;
  } catch (e) {
    getComputedStyle = () => {
      return {} as CSSStyleDeclaration;
    };
  }

  const style = getComputedStyle(el);

  // clientWidth/clientHeight: 默认整数，会向上取整，导致canvas > container
  // getBoundingClientRect：默认小数，但是在container上有css类似 transform: scale(0.5)时，获取结果不对
  // getComputedStyle：默认小数，获取最终结果，但是会包含padding；

  if (/^(\d*\.?\d+)(px)$/.exec(style.width)) {
    // 当dom元素的 display: 'none' 的时候，获取到的宽高会变成原始的样式配置，而不是计算后的像素值
    const computedWidth =
      parseFloat(style.width) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) || el.clientWidth - 1;

    const computedHeight =
      parseFloat(style.height) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) || el.clientHeight - 1;

    // 理论上不用向下取整，目前没加。
    return {
      width: computedWidth <= 0 ? defaultWidth : computedWidth,
      height: computedHeight <= 0 ? defaultHeight : computedHeight
    };
  }

  return { width: defaultWidth, height: defaultHeight };
}

/**
 * 获取元素的绝对位置坐标（相对于页面左上角）
 * @param element
 * @returns
 */
export function getElementAbsolutePosition(element: HTMLElement): IPointLike {
  const { x, y } = element.getBoundingClientRect();
  return { x, y };
}

/**
 * 获取元素的相对位置坐标（相对于其他dom元素）
 * @param element
 * @returns
 */
export function getElementRelativePosition(element: HTMLElement, base: HTMLElement): IPointLike {
  const posElement = getElementAbsolutePosition(element);
  const posBase = getElementAbsolutePosition(base);
  return { x: posElement.x - posBase.x, y: posElement.y - posBase.y };
}

export const getScrollLeft = (element: HTMLElement) => {
  if (element === globalThis?.document?.body) {
    return globalThis?.document?.documentElement?.scrollLeft || element.scrollLeft;
  } else if (element.tagName.toLowerCase() === 'html') {
    return 0;
  }
  return element.scrollLeft;
};
export const getScrollTop = (element: HTMLElement) => {
  if (element === globalThis?.document?.body) {
    return globalThis?.document?.documentElement?.scrollTop || element.scrollTop;
  } else if (element.tagName.toLowerCase() === 'html') {
    return 0;
  }
  return element.scrollTop;
};

export const getScaleX = (element: HTMLElement) => {
  return element.getBoundingClientRect().width / element.offsetWidth;
};

export const getScaleY = (element: HTMLElement) => {
  return element.getBoundingClientRect().height / element.offsetHeight;
};

/**
 * 获取目标元素的缩放因数
 * @param element 目标 dom 元素
 * @returns
 */
export const getScale = (element: HTMLElement) => {
  if (element.offsetWidth > 0) {
    return getScaleX(element);
  }
  return getScaleY(element);
};

/**
 * 判断是否是元素的父元素
 * @param element 从其父元素开始查找的 DOM 元素
 * @param target 要查找的目标父元素
 * @returns boolean, true 代表查找到，false 表示未找到
 */
export function hasParentElement(element: HTMLElement, target: HTMLElement): boolean {
  let parent = element.parentNode;

  while (parent !== null) {
    if (parent === target) {
      return true;
    }
    parent = parent.parentNode;
  }

  return false;
}

/**
 * 将style字符串转换成对象形式
 * @param style字符串 例如："color:red;line-height:20px;"
 * @returns style对象，如 { color: 'red', 'line-height': '20px' }
 */
export const styleStringToObject = (styleStr: string = '') => {
  const res: any = {};
  styleStr.split(';').forEach(item => {
    if (item) {
      const arr = item.split(':');

      if (arr.length === 2) {
        const key = arr[0].trim();
        const value = arr[1].trim();

        if (key && value) {
          res[key] = value;
        }
      }
    }
  });

  return res;
};

/**
 * 将小驼峰转换成中划线连接的字符串
 * @param str 如：'lineHeight'  => 'line-height'
 * @returns
 */
export const lowerCamelCaseToMiddle = (str: string) => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * 将中划线连接的字符串转换成驼峰字符串
 * @param str 如：'line-height'  => 'lineHeight'
 * @returns
 */
export function toCamelCase(str: string) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function isHTMLElement(obj: any): obj is Element {
  try {
    return obj instanceof Element;
  } catch {
    // 跨端 plan B
    const htmlElementKeys: (keyof Element)[] = [
      'children',
      'innerHTML',
      'classList',
      'setAttribute',
      'tagName',
      'getBoundingClientRect'
    ];
    const keys = Object.keys(obj);
    return htmlElementKeys.every(key => keys.includes(key));
  }
}
