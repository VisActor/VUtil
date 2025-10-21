import bin from '../src/transform/bin';

describe('bin transform', () => {
  test('basic bins by count', () => {
    const data = [] as any[];
    for (let i = 0; i < 100; i++) {
      data.push({ v: i });
    }
    const bins = bin(data, { field: 'v', bins: 10 });
    expect(bins.length).toBe(10);
    const total = bins.reduce((s: number, b: any) => s + b.count, 0);
    expect(total).toBe(100);
    // each bin should have roughly 10 counts
    for (let i = 0; i < bins.length; i++) {
      expect(bins[i].count).toBeGreaterThanOrEqual(8);
      expect(bins[i].count).toBeLessThanOrEqual(12);
    }
  });

  test('step produces correct bin widths', () => {
    const data = [] as any[];
    for (let i = 0; i <= 20; i++) {
      data.push({ v: i });
    }
    const bins = bin(data, { field: 'v', step: 5 });
    // step=5 -> bins covering [min,max] with width 5 => expect 5 bins (0-4,5-9,10-14,15-19,20)
    expect(bins.length).toBeGreaterThanOrEqual(4);
    // ensure bin edges spacing equals 5 or last smaller
    for (let i = 0; i < bins.length - 1; i++) {
      const w = bins[i].x1 - bins[i].x0;
      expect(w).toBeCloseTo(5, 12);
    }
  });

  test('explicit thresholds control bin edges', () => {
    const data = [{ v: 1 }, { v: 3 }, { v: 7 }, { v: 12 }];
    const thresholds = [0, 5, 10, 20];
    const bins = bin(data, { field: 'v', thresholds });
    expect(bins.length).toBe(3);
    expect(bins[0].count).toBe(2); // 1 and 3
    expect(bins[1].count).toBe(1); // 7
    expect(bins[2].count).toBe(1); // 12
  });

  test('extent overrides and includeValues', () => {
    const data = [
      { v: 2, id: 'a' },
      { v: 8, id: 'b' }
    ];
    const bins = bin(data, { field: 'v', step: 5, extent: [0, 10], includeValues: true });
    expect(bins.length).toBeGreaterThan(0);
    const values = bins.flatMap((b: any) => (b.values ? b.values.map((it: any) => it.id) : []));
    expect(values).toContain('a');
    expect(values).toContain('b');
  });

  test('empty data returns empty array', () => {
    const out = bin([], { field: 'x', bins: 5 });
    expect(Array.isArray(out)).toBeTruthy();
    expect(out.length).toBe(0);
  });
});
