/** 回归共用的稳定坐标与小型最小二乘求解器；不构造 XᵀX。 */
export interface RegressionPoint {
  x: number;
  y: number;
}
export interface RegressionBasis {
  xCenter: number;
  xScale: number;
  yCenter: number;
  yScale: number;
}

export function regressionPoints(data: readonly any[], x: (d: any) => number, y: (d: any) => number) {
  const points: RegressionPoint[] = [];
  data.forEach(d => {
    const a = x(d);
    const b = y(d);
    // 保留既有 accessor 对缺失观测的排除行为；无穷大不是可拟合观测。
    if (a != null && b != null && Number.isFinite(+a) && Number.isFinite(+b)) {
      points.push({ x: +a, y: +b });
    }
  });
  return points;
}

export function normalizeRegression(value: number, center: number, scale: number) {
  const delta = value - center;
  return Number.isFinite(delta) ? delta / scale : value / scale - center / scale;
}

export function regressionBasis(points: readonly RegressionPoint[]): RegressionBasis {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const p of points) {
    xMin = Math.min(xMin, p.x);
    xMax = Math.max(xMax, p.x);
    yMin = Math.min(yMin, p.y);
    yMax = Math.max(yMax, p.y);
  }
  if (!points.length) {
    return { xCenter: 0, xScale: 1, yCenter: 0, yScale: 1 };
  }
  const xCenter = xMin / 2 + xMax / 2;
  const yCenter = yMin / 2 + yMax / 2;
  return {
    xCenter,
    yCenter,
    xScale: Math.max(Math.abs(xMin - xCenter), Math.abs(xMax - xCenter)) || 1,
    yScale: Math.max(Math.abs(yMin - yCenter), Math.abs(yMax - yCenter)) || 1
  };
}

/** 秩不足时对 QR 的小型 R 做单边 Jacobi SVD，获得明确的最小范数解。 */
function minimumNorm(r: number[][], rhs: number[]) {
  const p = rhs.length;
  const a = r.map(row => row.slice());
  const v = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => +(i === j)));
  for (let sweep = 0; sweep < 50; sweep++) {
    let changed = false;
    for (let j = 0; j < p - 1; j++) {
      for (let k = j + 1; k < p; k++) {
        let aa = 0;
        let bb = 0;
        let ab = 0;
        for (let i = 0; i < p; i++) {
          aa += a[i][j] ** 2;
          bb += a[i][k] ** 2;
          ab += a[i][j] * a[i][k];
        }
        if (Math.abs(ab) <= Number.EPSILON * 8 * Math.sqrt(aa * bb)) {
          continue;
        }
        changed = true;
        const tau = (bb - aa) / (2 * ab);
        const t = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.hypot(1, tau));
        const c = 1 / Math.hypot(1, t);
        const s = c * t;
        for (let i = 0; i < p; i++) {
          const aj = a[i][j];
          const ak = a[i][k];
          const vj = v[i][j];
          const vk = v[i][k];
          a[i][j] = c * aj - s * ak;
          a[i][k] = s * aj + c * ak;
          v[i][j] = c * vj - s * vk;
          v[i][k] = s * vj + c * vk;
        }
      }
    }
    if (!changed) {
      break;
    }
  }
  const norms = Array.from({ length: p }, (_, j) => Math.hypot(...a.map(row => row[j])));
  const tolerance = Math.max(...norms) * Number.EPSILON * p * 64;
  const coef = new Array<number>(p).fill(0);
  let rank = 0;
  for (let j = 0; j < p; j++) {
    if (norms[j] <= tolerance) {
      continue;
    }
    rank++;
    let projection = 0;
    for (let i = 0; i < p; i++) {
      projection += a[i][j] * rhs[i];
    }
    projection /= norms[j] ** 2;
    for (let i = 0; i < p; i++) {
      coef[i] += v[i][j] * projection;
    }
  }
  return { coef, rank };
}

export function fitRegression(points: readonly RegressionPoint[], degree: number, basis = regressionBasis(points)) {
  const p = degree + 1;
  if (degree === 1) {
    let mx = 0;
    let my = 0;
    let n = 0;
    for (const row of points) {
      n++;
      mx += (normalizeRegression(row.x, basis.xCenter, basis.xScale) - mx) / n;
      my += (normalizeRegression(row.y, basis.yCenter, basis.yScale) - my) / n;
    }
    let sxx = 0;
    let sxy = 0;
    for (const row of points) {
      const dx = normalizeRegression(row.x, basis.xCenter, basis.xScale) - mx;
      sxx += dx * dx;
      sxy += dx * (normalizeRegression(row.y, basis.yCenter, basis.yScale) - my);
    }
    const b = sxx === 0 ? 0 : sxy / sxx;
    const coef = sxx === 0 ? [my / (1 + mx * mx), (mx * my) / (1 + mx * mx)] : [my - b * mx, b];
    return { coef, rank: n === 0 ? 0 : sxx === 0 ? 1 : 2, basis };
  }
  const r = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  const rhs = new Array<number>(p).fill(0);
  const row = new Array<number>(p);
  for (const point of points) {
    const z = normalizeRegression(point.x, basis.xCenter, basis.xScale);
    row[0] = 1;
    for (let j = 1; j < p; j++) {
      row[j] = row[j - 1] * z;
    }
    let value = normalizeRegression(point.y, basis.yCenter, basis.yScale);
    // 增量 Givens QR 仅保留 p×p 的 R，bootstrap 不分配 N×p 矩阵。
    for (let j = 0; j < p; j++) {
      const norm = Math.hypot(r[j][j], row[j]);
      if (norm === 0) {
        continue;
      }
      const c = r[j][j] / norm;
      const s = row[j] / norm;
      r[j][j] = norm;
      for (let k = j + 1; k < p; k++) {
        const previous = r[j][k];
        r[j][k] = c * previous + s * row[k];
        row[k] = -s * previous + c * row[k];
      }
      const previous = rhs[j];
      rhs[j] = c * previous + s * value;
      value = -s * previous + c * value;
    }
  }
  const tolerance = Math.max(...r.map((row, i) => Math.abs(row[i]))) * Number.EPSILON * p * 64;
  if (r.some((row, i) => Math.abs(row[i]) <= tolerance)) {
    return { ...minimumNorm(r, rhs), basis };
  }
  const coef = new Array<number>(p);
  for (let i = p - 1; i >= 0; i--) {
    let value = rhs[i];
    for (let j = i + 1; j < p; j++) {
      value -= r[i][j] * coef[j];
    }
    coef[i] = value / r[i][i];
  }
  return { coef, rank: p, basis };
}

export function regressionPrediction(model: ReturnType<typeof fitRegression>, x: number) {
  const z = normalizeRegression(x, model.basis.xCenter, model.basis.xScale);
  let value = 0;
  for (let j = model.coef.length - 1; j >= 0; j--) {
    value = value * z + model.coef[j];
  }
  return model.basis.yCenter + model.basis.yScale * value;
}

/** 保留公开的升幂 coef；预测始终使用稳定基底。 */
export function regressionCoefficients(model: ReturnType<typeof fitRegression>) {
  let coef = [model.coef[model.coef.length - 1]];
  const a = -model.basis.xCenter / model.basis.xScale;
  const b = 1 / model.basis.xScale;
  for (let j = model.coef.length - 2; j >= 0; j--) {
    const next = new Array<number>(coef.length + 1).fill(0);
    coef.forEach((c, i) => {
      next[i] += a * c;
      next[i + 1] += b * c;
    });
    next[0] += model.coef[j];
    coef = next;
  }
  coef = coef.map(c => c * model.basis.yScale);
  coef[0] += model.basis.yCenter;
  if (coef.some(c => !Number.isFinite(c))) {
    throw new RangeError('Regression coefficients are not finite');
  }
  return coef;
}

export function regressionGrid(min: number, max: number, count: number, predict: (x: number) => number) {
  if (!Number.isInteger(count) || count <= 0 || !Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }
  const width = max - min;
  const step = count === 1 ? 0 : width / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    const x = i === 0 ? min : i === count - 1 ? max : Number.isFinite(width) ? min + i * step : (1 - t) * min + t * max;
    return { x, y: predict(x) };
  });
}
