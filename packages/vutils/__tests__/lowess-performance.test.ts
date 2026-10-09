import { execFileSync } from 'child_process';
import path from 'path';

/** 使用本次构建的实际 Node 包；构建为性能验收的明确前置步骤。 */
function benchmark(n: number, maxSamples?: number) {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [path.resolve(__dirname, '../benchmarks/lowess.cjs'), String(n), ...(maxSamples ? [String(maxSamples)] : [])],
      { encoding: 'utf8' }
    )
  );
}

test.each([
  [1000, 100],
  [5000, 150],
  [10000, 100],
  [20000, 200]
])('full-data LOWESS with explicit delta: %i observations within %ims', (n, budget) => {
  const result = benchmark(n);
  expect(result.nodes).toBe(n);
  expect(result.grid).toHaveLength(50);
  expect(result.elapsed).toBeLessThan(budget);
  expect(Math.abs(result.grid[25].y)).toBeLessThan(0.5);
});
test.each([
  [500, 100],
  [2000, 200]
])('explicit maxSamples=%i within %ims', (count, budget) => {
  const result = benchmark(10000, count);
  expect(result.nodes).toBe(count);
  expect(result.elapsed).toBeLessThan(budget);
  expect(result.grid).toHaveLength(50);
});
