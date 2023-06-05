/**
 * 将 hex 格式颜色转换为 rgb 格式
 * @param str hex 格式的颜色值
 * @returns rgb 格式
 */
export default function hexToRgb(str: string): [number, number, number] {
  let r = '';
  let g = '';
  let b = '';
  const strtIndex = str[0] === '#' ? 1 : 0;
  for (let i = strtIndex; i < str.length; i++) {
    if (str[i] === '#') {
      continue;
    }
    if (i < strtIndex + 2) {
      r += str[i];
    } else if (i < strtIndex + 4) {
      g += str[i];
    } else if (i < strtIndex + 6) {
      b += str[i];
    }
  }
  const ri = parseInt(r, 16);
  const gi = parseInt(g, 16);
  const bi = parseInt(b, 16);
  return [ri, gi, bi];
}
