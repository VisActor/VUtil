import { regressionLowess } from '../src/common/regression-lowess';

describe('LOWESS Regression Accuracy Tests', () => {
  describe('Known Function Approximation', () => {
    it('should approximate linear function accurately', () => {
      // y = 2x + 1
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 100; i++) {
        const x = i / 10;
        const y = 2 * x + 1 + (Math.random() - 0.5) * 0.1;
        data.push({ x, y });
      }

      const lowess = regressionLowess(data, undefined, undefined, {
        span: 0.3,
        degree: 1,
        maxSamples: 100
      });
      const grid = lowess.evaluateGrid(20);

      // Check predictions at several points
      const p0 = lowess.predict(0) as number;
      const p5 = lowess.predict(5) as number;
      const p99 = lowess.predict(9.9) as number;

      // At x=0, y≈1
      expect(Math.abs(p0 - 1)).toBeLessThan(0.5);
      // At x=5, y≈11
      expect(Math.abs(p5 - 11)).toBeLessThan(1);
      // At x=9.9, y≈20.8
      expect(Math.abs(p99 - 20.8)).toBeLessThan(1);

      // Grid should have correct length
      expect(grid.length).toBe(20);
      expect(grid[0].x).toBeLessThanOrEqual(grid[grid.length - 1].x);
    });

    it('should approximate quadratic function', () => {
      // y = x^2
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i <= 100; i++) {
        const x = (i - 50) / 10; // -5 to 5
        const y = x * x + (Math.random() - 0.5) * 0.5;
        data.push({ x, y });
      }

      const lowess = regressionLowess(data, undefined, undefined, {
        span: 0.3,
        degree: 1,
        maxSamples: 100
      });

      // Test at key points
      const p0 = lowess.predict(0) as number; // Should be ~0
      const p2 = lowess.predict(2) as number; // Should be ~4
      const pNeg2 = lowess.predict(-2) as number; // Should be ~4

      expect(Math.abs(p0)).toBeLessThan(1);
      expect(Math.abs(p2 - 4)).toBeLessThan(1.5);
      expect(Math.abs(pNeg2 - 4)).toBeLessThan(1.5);
    });

    it('should approximate sine wave', () => {
      // y = sin(x)
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i <= 200; i++) {
        const x = (i / 200) * 2 * Math.PI; // 0 to 2π
        const y = Math.sin(x) + (Math.random() - 0.5) * 0.1;
        data.push({ x, y });
      }

      const lowess = regressionLowess(data, undefined, undefined, {
        span: 0.2,
        degree: 1,
        maxSamples: 200
      });

      // sin(0) ≈ 0
      const p0 = lowess.predict(0) as number;
      expect(Math.abs(p0)).toBeLessThan(0.3);

      // sin(π/2) ≈ 1
      const pPiHalf = lowess.predict(Math.PI / 2) as number;
      expect(Math.abs(pPiHalf - 1)).toBeLessThan(0.3);

      // sin(π) ≈ 0
      const pPi = lowess.predict(Math.PI) as number;
      expect(Math.abs(pPi)).toBeLessThan(0.3);

      // sin(3π/2) ≈ -1
      const p3PiHalf = lowess.predict((3 * Math.PI) / 2) as number;
      expect(Math.abs(p3PiHalf + 1)).toBeLessThan(0.3);
    });
  });

  describe('Sampling Consistency', () => {
    it('should produce similar results with different maxSamples', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 5000; i++) {
        const x = i / 500;
        const y = Math.sin(x) + (Math.random() - 0.5) * 0.2;
        data.push({ x, y });
      }

      const lowess500 = regressionLowess(data, undefined, undefined, { maxSamples: 500 });
      const lowess1000 = regressionLowess(data, undefined, undefined, { maxSamples: 1000 });
      const lowess2000 = regressionLowess(data, undefined, undefined, { maxSamples: 2000 });

      // Test at multiple points
      const testPoints = [0, 2.5, 5, 7.5, 9.9];

      for (const x of testPoints) {
        const p500 = lowess500.predict(x) as number;
        const p1000 = lowess1000.predict(x) as number;
        const p2000 = lowess2000.predict(x) as number;

        // Results should be reasonably similar
        expect(Math.abs(p500 - p1000)).toBeLessThan(0.5);
        expect(Math.abs(p1000 - p2000)).toBeLessThan(0.3);
      }
    });

    it('should handle small datasets without sampling', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 50; i++) {
        const x = i / 5;
        const y = x * 2 + 3;
        data.push({ x, y });
      }

      const lowess = regressionLowess(data, undefined, undefined, { maxSamples: 1000 });

      // For linear data, predictions should be very accurate
      const p5 = lowess.predict(5) as number;
      expect(Math.abs(p5 - 13)).toBeLessThan(0.5); // 2*5+3=13
    });
  });

  describe('Edge Cases', () => {
    it('should handle constant data', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 100; i++) {
        data.push({ x: i, y: 5 });
      }

      const lowess = regressionLowess(data);
      const grid = lowess.evaluateGrid(10);

      // All predictions should be near 5
      grid.forEach(point => {
        expect(Math.abs(point.y - 5)).toBeLessThan(0.1);
      });
    });

    it('should handle single x value', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 50; i++) {
        data.push({ x: 1, y: 3 + (Math.random() - 0.5) * 0.1 });
      }

      const lowess = regressionLowess(data);
      const grid = lowess.evaluateGrid(10);

      expect(grid.length).toBe(10);
      grid.forEach(point => {
        expect(point.x).toBe(1);
        expect(Math.abs(point.y - 3)).toBeLessThan(0.5);
      });
    });

    it('should handle very small datasets', () => {
      const data = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 }
      ];

      const lowess = regressionLowess(data);
      const grid = lowess.evaluateGrid(5);

      expect(grid.length).toBe(5);
      expect(grid[0].x).toBe(0);
      expect(grid[grid.length - 1].x).toBe(2);
    });

    it('should handle empty dataset', () => {
      const data: { x: number; y: number }[] = [];
      const lowess = regressionLowess(data);
      const grid = lowess.evaluateGrid(10);

      expect(grid.length).toBe(0);
      expect(lowess.predict(5)).toBe(0);
    });

    it('should handle unsorted data correctly', () => {
      const data = [
        { x: 5, y: 10 },
        { x: 1, y: 2 },
        { x: 3, y: 6 },
        { x: 2, y: 4 },
        { x: 4, y: 8 }
      ];

      const lowess = regressionLowess(data);
      const grid = lowess.evaluateGrid(5);

      // Should still produce sorted grid
      expect(grid.length).toBe(5);
      for (let i = 1; i < grid.length; i++) {
        expect(grid[i].x).toBeGreaterThanOrEqual(grid[i - 1].x);
      }
    });
  });

  describe('Batch Predictions', () => {
    it('should handle array of x values', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 100; i++) {
        const x = i / 10;
        const y = x * 2 + 1;
        data.push({ x, y });
      }

      const lowess = regressionLowess(data);
      const xValues = [0, 2.5, 5, 7.5, 9.9];
      const predictions = lowess.predict(xValues) as number[];

      expect(Array.isArray(predictions)).toBe(true);
      expect(predictions.length).toBe(5);

      // Check individual predictions
      expect(Math.abs(predictions[0] - 1)).toBeLessThan(0.5); // x=0, y≈1
      expect(Math.abs(predictions[2] - 11)).toBeLessThan(1); // x=5, y≈11
    });
  });

  describe('Confidence Intervals', () => {
    it('should produce valid confidence intervals', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 100; i++) {
        const x = i / 10;
        const y = 2 * x + 1 + (Math.random() - 0.5) * 1;
        data.push({ x, y });
      }

      const lowess = regressionLowess(data, undefined, undefined, {
        alpha: 0.05,
        maxSamples: 100
      });
      const ci = lowess.confidenceInterval(20);

      expect(ci.length).toBe(20);

      ci.forEach(interval => {
        // Check structure
        expect(interval).toHaveProperty('x');
        expect(interval).toHaveProperty('mean');
        expect(interval).toHaveProperty('lower');
        expect(interval).toHaveProperty('upper');
        expect(interval).toHaveProperty('predLower');
        expect(interval).toHaveProperty('predUpper');

        // Check ordering: predLower <= lower <= mean <= upper <= predUpper
        expect(interval.predLower).toBeLessThanOrEqual(interval.lower);
        expect(interval.lower).toBeLessThanOrEqual(interval.mean);
        expect(interval.mean).toBeLessThanOrEqual(interval.upper);
        expect(interval.upper).toBeLessThanOrEqual(interval.predUpper);
      });
    });
  });

  describe('Custom Accessors', () => {
    it('should work with custom x and y accessors', () => {
      const data = [];
      for (let i = 0; i < 100; i++) {
        const val = i / 10;
        data.push({
          time: val,
          value: val * 3 + 2,
          other: 'data'
        });
      }

      const lowess = regressionLowess(
        data,
        d => d.time,
        d => d.value,
        { maxSamples: 100 }
      );

      const p5 = lowess.predict(5) as number;
      expect(Math.abs(p5 - 17)).toBeLessThan(1); // 5*3+2=17
    });
  });

  describe('Degree Parameter', () => {
    it('should work with degree=0 (constant fit)', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 100; i++) {
        const x = i / 10;
        const y = x * 2 + (Math.random() - 0.5) * 0.5;
        data.push({ x, y });
      }

      const lowess = regressionLowess(data, undefined, undefined, {
        degree: 0,
        maxSamples: 100
      });
      const grid = lowess.evaluateGrid(20);

      expect(grid.length).toBe(20);
      // Degree 0 should still produce reasonable results
      grid.forEach(point => {
        expect(typeof point.y).toBe('number');
        expect(isFinite(point.y)).toBe(true);
      });
    });

    it('should work with degree=1 (linear fit)', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 100; i++) {
        const x = i / 10;
        const y = x * 2 + (Math.random() - 0.5) * 0.5;
        data.push({ x, y });
      }

      const lowess = regressionLowess(data, undefined, undefined, {
        degree: 1,
        maxSamples: 100
      });
      const grid = lowess.evaluateGrid(20);

      expect(grid.length).toBe(20);
      // Degree 1 should follow the linear trend more closely
      const p0 = lowess.predict(0) as number;
      const p5 = lowess.predict(5) as number;
      const p10 = lowess.predict(9.9) as number;

      expect(Math.abs(p0)).toBeLessThan(1);
      expect(Math.abs(p5 - 10)).toBeLessThan(1.5);
      expect(Math.abs(p10 - 19.8)).toBeLessThan(2);
    });
  });

  describe('Span Parameter', () => {
    it('should work with different span values', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 200; i++) {
        const x = i / 20;
        const y = Math.sin(x) + (Math.random() - 0.5) * 0.3;
        data.push({ x, y });
      }

      // Smaller span = more local, follows noise more
      const lowessSmall = regressionLowess(data, undefined, undefined, {
        span: 0.1,
        maxSamples: 200
      });

      // Larger span = more global, smoother
      const lowessLarge = regressionLowess(data, undefined, undefined, {
        span: 0.5,
        maxSamples: 200
      });

      const testX = Math.PI;
      const pSmall = lowessSmall.predict(testX) as number;
      const pLarge = lowessLarge.predict(testX) as number;

      // Both should approximate sin(π) ≈ 0, but may differ slightly
      expect(Math.abs(pSmall)).toBeLessThan(0.5);
      expect(Math.abs(pLarge)).toBeLessThan(0.5);
    });
  });

  describe('Robustness Iterations', () => {
    it('should handle outliers better with iterations', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 100; i++) {
        const x = i / 10;
        let y = x * 2 + 1;

        // Add some outliers
        if (i % 20 === 0) {
          y += (Math.random() - 0.5) * 10;
        } else {
          y += (Math.random() - 0.5) * 0.5;
        }
        data.push({ x, y });
      }

      // With iterations (enabled for small datasets)
      const lowessWithIter = regressionLowess(data, undefined, undefined, {
        iterations: 2,
        maxSamples: 100
      });

      // Without iterations
      const lowessNoIter = regressionLowess(data, undefined, undefined, {
        iterations: 0,
        maxSamples: 100
      });

      const p5WithIter = lowessWithIter.predict(5) as number;
      const p5NoIter = lowessNoIter.predict(5) as number;

      // Both should be reasonable (around 11), but iterations might be more robust
      expect(Math.abs(p5WithIter - 11)).toBeLessThan(2);
      expect(Math.abs(p5NoIter - 11)).toBeLessThan(2);
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle 10K points efficiently and accurately', () => {
      const data: { x: number; y: number }[] = [];
      for (let i = 0; i < 10000; i++) {
        const x = i / 1000;
        const y = Math.sin(x) + (Math.random() - 0.5) * 0.2;
        data.push({ x, y });
      }

      const start = performance.now();
      const lowess = regressionLowess(data); // Uses default maxSamples=1000
      const grid = lowess.evaluateGrid(50);
      const elapsed = performance.now() - start;

      // Performance check
      expect(elapsed).toBeLessThan(100);

      // Accuracy check
      expect(grid.length).toBe(50);

      // Check some key points
      const p0 = lowess.predict(0) as number;
      const pPi = lowess.predict(Math.PI) as number;
      const p2Pi = lowess.predict(2 * Math.PI) as number;

      expect(Math.abs(p0)).toBeLessThan(0.3); // sin(0) ≈ 0
      expect(Math.abs(pPi)).toBeLessThan(0.3); // sin(π) ≈ 0
      expect(Math.abs(p2Pi)).toBeLessThan(0.3); // sin(2π) ≈ 0
    });
  });
});
