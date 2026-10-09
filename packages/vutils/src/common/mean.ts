/** 有限数值的均值；空输入没有均值，不修改输入。 */
export function mean(values: readonly number[]): number | undefined {
  if (!values.length) {
    return undefined;
  }
  let scale = 0;
  for (const value of values) {
    if (!Number.isFinite(value)) {
      throw new RangeError('mean requires finite numbers');
    }
    scale = Math.max(scale, Math.abs(value));
  }
  if (scale === 0) {
    return 0;
  }
  let sum = 0;
  let correction = 0;
  for (const value of values) {
    const next = value / scale;
    const total = sum + next;
    // Neumaier compensation retains small contributions even when larger values cancel.
    correction += Math.abs(sum) >= Math.abs(next) ? sum - total + next : next - total + sum;
    sum = total;
  }
  return ((sum + correction) / values.length) * scale;
}
