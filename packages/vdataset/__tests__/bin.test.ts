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

  test('outputNames renames fields', () => {
    const data = [{ v: 1 }, { v: 2 }, { v: 3 }];
    const out = bin(data, {
      field: 'v',
      bins: 2,
      includeValues: true,
      outputNames: { x0: 'start', x1: 'end', count: 'cnt', values: 'items' }
    });
    expect(out.length).toBe(2);
    // each bin should have renamed keys
    for (let i = 0; i < out.length; i++) {
      expect(out[i]).toHaveProperty('start');
      expect(out[i]).toHaveProperty('end');
      expect(out[i]).toHaveProperty('cnt');
      expect(out[i]).toHaveProperty('items');
    }
    // counts should sum to 3
    const total = out.reduce((s: number, b: any) => s + b.cnt, 0);
    expect(total).toBe(3);
  });

  test('countField is used as weights and percentage calculated correctly', () => {
    const data = [
      { v: 1, w: 2 }, // goes to first bin
      { v: 2, w: 3 }, // goes to first bin
      { v: 8, w: 5 } // goes to second bin
    ];
    // thresholds split at 5 -> two bins [0,5) and [5,10]
    const out: any = bin(data, { field: 'v', thresholds: [0, 5, 10], countField: 'w' });
    expect(out.length).toBe(2);
    // first bin should have count 5 (2+3), second bin 5
    expect(out[0].count).toBe(5);
    expect(out[1].count).toBe(5);
    // percentage should be 0.5 for both
    expect(out[0].percentage).toBeCloseTo(0.5, 12);
    expect(out[1].percentage).toBeCloseTo(0.5, 12);
  });

  test('renamed percentage field via outputNames is present and correct', () => {
    const data = [
      { v: 1, w: 1 },
      { v: 2, w: 1 },
      { v: 9, w: 2 }
    ];
    const out: any = bin(data, {
      field: 'v',
      thresholds: [0, 5, 10],
      countField: 'w',
      outputNames: { percentage: 'pct' }
    });
    expect(out.length).toBe(2);
    // counts: first bin 2, second bin 2 -> percentages 0.5 each
    expect(out[0].cnt === undefined).toBeTruthy(); // ensure default countName not renamed here
    expect(out[0].pct).toBeCloseTo(0.5, 12);
    expect(out[1].pct).toBeCloseTo(0.5, 12);
  });
});
