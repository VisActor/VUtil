import isNil from './isNil';

const truncate = (
  str: string | number,
  length: number,
  align: 'left' | 'center' | 'right' | unknown = 'right',
  ellipsis?: string
) => {
  const e = !isNil(ellipsis) ? ellipsis : '\u2026';
  const s = str + '';
  const n = s.length;
  const l = Math.max(0, length - e.length);

  if (n <= length) {
    return s;
  }

  if (align === 'left') {
    return e + s.slice(n - l);
  }

  return align === 'center' ? s.slice(0, Math.ceil(l / 2)) + e + s.slice(n - Math.floor(l / 2)) : s.slice(0, l) + e;
};

export default truncate;
