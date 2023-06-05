/**
 * @see https://github.com/lodash/lodash/blob/master/throttle.js
 */
import debounce from './debounce';
import isObject from './isObject';

function throttle<T, S>(
  func: (...args: T[]) => S,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: T[]) => S {
  let leading = true;
  let trailing = true;

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    leading,
    trailing,
    maxWait: wait
  });
}

export default throttle;
