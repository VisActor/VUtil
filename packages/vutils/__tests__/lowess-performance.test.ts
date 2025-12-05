import { regressionLowess } from '../src/common/regression-lowess';

// Skip performance tests in CI environments (GitHub Actions sets CI=true by default)
// Can be overridden by setting RUN_PERF_TESTS=true
const shouldRunPerfTests = process.env.RUN_PERF_TESTS === 'true' || !process.env.CI;
const describePerf = shouldRunPerfTests ? describe : describe.skip;

describePerf('LOWESS Performance Test', () => {
  function generateTestData(n: number) {
    const data: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const x = i / n;
      // y = sin(2πx) + noise
      const y = Math.sin(2 * Math.PI * x) + (Math.random() - 0.5) * 0.2;
      data.push({ x, y });
    }
    return data;
  }

  it('should handle 1K points efficiently', () => {
    const data = generateTestData(1000);
    const start = performance.now();
    const lowess = regressionLowess(data);
    const grid = lowess.evaluateGrid(50);
    const end = performance.now();

    expect(grid.length).toBe(50);
    expect(end - start).toBeLessThan(100); // Should be under 100ms
  });

  it('should handle 5K points efficiently', () => {
    const data = generateTestData(5000);
    const start = performance.now();
    const lowess = regressionLowess(data);
    const grid = lowess.evaluateGrid(50);
    const end = performance.now();

    expect(grid.length).toBe(50);
    expect(end - start).toBeLessThan(150); // Should be under 150ms
  });

  it('should handle 10K points within 100ms', () => {
    const data = generateTestData(10000);
    const start = performance.now();
    const lowess = regressionLowess(data);
    const grid = lowess.evaluateGrid(50);
    const end = performance.now();

    expect(grid.length).toBe(50);
    expect(end - start).toBeLessThan(100); // Target: under 100ms
  });

  it('should handle 20K points reasonably', () => {
    const data = generateTestData(20000);
    const start = performance.now();
    const lowess = regressionLowess(data);
    const grid = lowess.evaluateGrid(50);
    const end = performance.now();

    expect(grid.length).toBe(50);
    expect(end - start).toBeLessThan(200); // Should handle 20K reasonably
  });

  it('should produce reasonable results with sampling', () => {
    const data = generateTestData(10000);
    const lowess = regressionLowess(data, undefined, undefined, { maxSamples: 1000 });
    const grid = lowess.evaluateGrid(50);

    expect(grid.length).toBe(50);
    // Check that the curve is reasonable (should follow sin wave pattern)
    const midPoint = grid[25];
    expect(midPoint.x).toBeCloseTo(0.5, 1);
    // At x=0.5, sin(2π*0.5) = sin(π) ≈ 0
    expect(Math.abs(midPoint.y)).toBeLessThan(0.5);
  });

  it('should allow custom maxSamples parameter', () => {
    const data = generateTestData(10000);

    // With lower maxSamples, should be faster
    const start1 = performance.now();
    const lowess1 = regressionLowess(data, undefined, undefined, { maxSamples: 500 });
    const grid1 = lowess1.evaluateGrid(50);
    const time1 = performance.now() - start1;

    // With higher maxSamples, might be slower but more accurate
    const start2 = performance.now();
    const lowess2 = regressionLowess(data, undefined, undefined, { maxSamples: 2000 });
    const grid2 = lowess2.evaluateGrid(50);
    const time2 = performance.now() - start2;

    // Verify results are produced
    expect(grid1.length).toBe(50);
    expect(grid2.length).toBe(50);

    // Relaxed thresholds for CI environments (allow 3x margin)
    expect(time1).toBeLessThan(100);
    expect(time2).toBeLessThan(200);
  });
});
