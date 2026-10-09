export type CorrelationMethod = 'pearson' | 'spearman' | 'kendall';

function pearson(x: readonly number[], y: readonly number[]): number | undefined {
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < x.length; i++) {
    sx = Math.max(sx, Math.abs(x[i]));
    sy = Math.max(sy, Math.abs(y[i]));
  }
  if (!sx || !sy) {
    return undefined;
  }
  let mx = 0;
  let my = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < x.length; i++) {
    const vx = x[i] / sx - cx;
    const vy = y[i] / sy - cy;
    const tx = mx + vx;
    const ty = my + vy;
    cx = tx - mx - vx;
    cy = ty - my - vy;
    mx = tx;
    my = ty;
  }
  mx /= x.length;
  my /= x.length;
  let xx = 0;
  let yy = 0;
  let xy = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] / sx - mx;
    const dy = y[i] / sy - my;
    xx += dx * dx;
    yy += dy * dy;
    xy += dx * dy;
  }
  if (xx === 0 || yy === 0) {
    return undefined;
  }
  const result = xy / Math.sqrt(xx * yy);
  // 仅修正浮点舍入越过理论端点的几个 ulp。
  if (Math.abs(result) > 1 && Math.abs(result) <= 1 + 8 * Number.EPSILON) {
    return Math.sign(result);
  }
  return result;
}

function ranks(values: readonly number[]): number[] {
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const result = new Array<number>(values.length);
  for (let start = 0; start < order.length; ) {
    let end = start + 1;
    while (end < order.length && order[end].value === order[start].value) {
      end++;
    }
    const rank = (start + end + 1) / 2;
    for (let i = start; i < end; i++) {
      result[order[i].index] = rank;
    }
    start = end;
  }
  return result;
}

function kendall(x: readonly number[], y: readonly number[]): number | undefined {
  const pairs = x.map((value, index) => ({ x: value, y: y[index] })).sort((a, b) => a.x - b.x || a.y - b.y);
  const sortedY = [...y].sort((a, b) => a - b);
  const yRanks = new Map<number, number>();
  let tiesY = 0;
  for (let start = 0; start < sortedY.length; ) {
    let end = start + 1;
    while (end < sortedY.length && sortedY[end] === sortedY[start]) {
      end++;
    }
    tiesY += ((end - start) * (end - start - 1)) / 2;
    yRanks.set(sortedY[start], yRanks.size + 1);
    start = end;
  }
  const tree = new Float64Array(yRanks.size + 1);
  let tiesX = 0;
  let tiesBoth = 0;
  let discordant = 0;
  for (let start = 0; start < pairs.length; ) {
    let end = start + 1;
    while (end < pairs.length && pairs[end].x === pairs[start].x) {
      end++;
    }
    tiesX += ((end - start) * (end - start - 1)) / 2;
    for (let i = start; i < end; ) {
      let j = i + 1;
      while (j < end && pairs[j].y === pairs[i].y) {
        j++;
      }
      tiesBoth += ((j - i) * (j - i - 1)) / 2;
      i = j;
    }
    // 同 x 组先查询再更新，避免将 x ties 算成逆序。
    for (let i = start; i < end; i++) {
      let lessOrEqual = 0;
      for (let rank = yRanks.get(pairs[i].y)!; rank > 0; rank -= rank & -rank) {
        lessOrEqual += tree[rank];
      }
      discordant += start - lessOrEqual;
    }
    for (let i = start; i < end; i++) {
      for (let rank = yRanks.get(pairs[i].y)!; rank < tree.length; rank += rank & -rank) {
        tree[rank]++;
      }
    }
    start = end;
  }
  const total = (x.length * (x.length - 1)) / 2;
  if (total === tiesX || total === tiesY) {
    return undefined;
  }
  return (total - tiesX - tiesY + tiesBoth - 2 * discordant) / Math.sqrt((total - tiesX) * (total - tiesY));
}

/** 等长有限样本的相关系数；常量/不足两条返回 undefined，不修改数组。 */
export function correlation(
  x: readonly number[],
  y: readonly number[],
  method: CorrelationMethod = 'pearson'
): number | undefined {
  if (
    x.length !== y.length ||
    !['pearson', 'spearman', 'kendall'].includes(method) ||
    x.some(value => !Number.isFinite(value)) ||
    y.some(value => !Number.isFinite(value))
  ) {
    throw new RangeError('correlation requires equal finite arrays and a supported method');
  }
  if (x.length < 2) {
    return undefined;
  }
  return method === 'kendall' ? kendall(x, y) : method === 'spearman' ? pearson(ranks(x), ranks(y)) : pearson(x, y);
}
