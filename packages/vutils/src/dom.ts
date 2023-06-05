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

/**
 * 获取元素的绝对位置坐标（相对于页面左上角）
 * @param element
 * @returns
 */
export function getElementAbsolutePosition(element: HTMLElement): IPointLike {
  //计算x坐标
  let actualLeft = element.offsetLeft;
  let current = element.offsetParent as HTMLElement;
  while (current) {
    actualLeft += current.offsetLeft;
    current = current.offsetParent as HTMLElement;
  }
  //计算y坐标
  let actualTop = element.offsetTop;
  current = element.offsetParent as HTMLElement;
  while (current) {
    actualTop += current.offsetTop + current.clientTop;
    current = current.offsetParent as HTMLElement;
  }
  return { x: actualLeft, y: actualTop };
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

const getScrollLeft = (element: HTMLElement) => {
  if (element === globalThis?.document?.body) {
    return globalThis?.document?.documentElement?.scrollLeft || element.scrollLeft;
  } else if (element.tagName.toLowerCase() === 'html') {
    return 0;
  }
  return element.scrollLeft;
};
const getScrollTop = (element: HTMLElement) => {
  if (element === globalThis?.document?.body) {
    return globalThis?.document?.documentElement?.scrollTop || element.scrollTop;
  } else if (element.tagName.toLowerCase() === 'html') {
    return 0;
  }
  return element.scrollTop;
};

/**
 * 获取元素的绝对滚动偏移量
 * @param element
 * @returns
 */
export function getElementAbsoluteScrollOffset(element: HTMLElement): IPointLike {
  //计算x坐标
  let actualLeft = getScrollLeft(element);
  let current = element.parentElement as HTMLElement;
  while (current) {
    actualLeft += getScrollLeft(current);
    current = current.parentElement as HTMLElement;
  }
  //计算y坐标
  let actualTop = getScrollTop(element);
  current = element.parentElement as HTMLElement;
  while (current) {
    actualTop += getScrollTop(current);
    current = current.parentElement as HTMLElement;
  }
  return { x: actualLeft, y: actualTop };
}

/**
 * 获取元素的相对滚动偏移量（相对于其他dom元素）
 * @param element
 * @returns
 */
export function getElementRelativeScrollOffset(element: HTMLElement, base: HTMLElement): IPointLike {
  const posElement = getElementAbsoluteScrollOffset(element);
  const posBase = getElementAbsoluteScrollOffset(base);
  return { x: posElement.x - posBase.x, y: posElement.y - posBase.y };
}

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
