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

  test('bins by count should fill bins', () => {
    const data = [
      {
        color: 'red',
        shape: 'circle',
        v: 1
      },
      {
        color: 'red',
        shape: 'circle',
        v: 1
      },
      {
        color: 'red',
        shape: 'circle',
        v: 1
      },
      {
        color: 'red',
        shape: 'circle',
        v: 2
      },
      {
        color: 'red',
        shape: 'circle',
        v: 5
      },
      {
        color: 'red',
        shape: 'circle',
        v: 7
      },
      {
        color: 'red',
        shape: 'circle',
        v: 8
      },
      {
        color: 'red',
        shape: 'circle',
        v: 9
      },
      {
        color: 'red',
        shape: 'circle',
        v: 10
      },
      {
        color: 'blue',
        shape: 'circle',
        v: 1
      },
      {
        color: 'blue',
        shape: 'circle',
        v: 1
      },
      {
        color: 'blue',
        shape: 'circle',
        v: 1
      },
      {
        color: 'blue',
        shape: 'circle',
        v: 2
      },
      {
        color: 'blue',
        shape: 'circle',
        v: 5
      },
      {
        color: 'blue',
        shape: 'circle',
        v: 7
      },
      {
        color: 'blue',
        shape: 'circle',
        v: 8
      },
      {
        color: 'blue',
        shape: 'circle',
        v: 9
      },
      {
        color: 'red',
        shape: 'triangle',
        v: 1
      },
      {
        color: 'red',
        shape: 'triangle',
        v: 1
      },
      {
        color: 'red',
        shape: 'triangle',
        v: 1
      },
      {
        color: 'red',
        shape: 'triangle',
        v: 2
      },
      {
        color: 'red',
        shape: 'triangle',
        v: 5
      },
      {
        color: 'red',
        shape: 'triangle',
        v: 7
      },
      {
        color: 'red',
        shape: 'triangle',
        v: 8
      },
      {
        color: 'red',
        shape: 'triangle',
        v: 9
      },
      {
        color: 'blue',
        shape: 'triangle',
        v: 1
      },
      {
        color: 'blue',
        shape: 'triangle',
        v: 1
      },
      {
        color: 'blue',
        shape: 'triangle',
        v: 1
      },
      {
        color: 'blue',
        shape: 'triangle',
        v: 2
      },
      {
        color: 'blue',
        shape: 'triangle',
        v: 5
      },
      {
        color: 'blue',
        shape: 'triangle',
        v: 7
      },
      {
        color: 'blue',
        shape: 'triangle',
        v: 8
      },
      {
        color: 'blue',
        shape: 'triangle',
        v: 9
      }
    ];

    const bins = bin(data, {
      field: 'v',
      bins: 5,
      facetField: ['color', 'shape']
    });
    expect(bins.length).toBe(2 * 2 * 5); // color * shape * bins
  });
  test('bins in max value and threshold', () => {
    const data = [1, 1, 1, 2, 5, 7, 8, 9, 10].map(v => ({ v }));
    const bins = bin(data, { field: 'v', bins: 10 });
    expect(bins.length).toBe(10);
    expect(bins[9].x0).toBe(10);
    expect(bins[9].x1).toBe(11);
  });

  test('bins in steps', () => {
    const data = [1, 1, 1, 2, 5, 7, 8, 9, 10].map(v => ({ v }));
    const bins = bin(data, { field: 'v', step: 2, bins: 10 });
    expect(bins.length).toBe(6);
    expect(bins[5].x0).toBe(10);
    expect(bins[5].x1).toBe(12);
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

  test('groupField (single) aggregates counts per group per bin', () => {
    const data = [
      { g: 'A', v: 1, w: 2 },
      { g: 'A', v: 2, w: 3 },
      { g: 'B', v: 1, w: 1 },
      { g: 'A', v: 8, w: 4 }
    ];
    // thresholds split at 5 -> two bins
    const out: any = bin(data, { field: 'v', thresholds: [0, 5, 10], countField: 'w', groupField: 'g' });
    expect(out.length).toBe(4);
    const byKey = (g: string, x0: number) =>
      out.find((item: any) => item.g === g && item.x0 === x0 && item.x1 === x0 + 5);
    expect(byKey('A', 0)).toMatchObject({ count: 5 });
    expect(byKey('B', 0)).toMatchObject({ count: 1 });
    expect(byKey('A', 5)).toMatchObject({ count: 4 });
    expect(byKey('B', 5)).toMatchObject({ count: 0 });
    expect(byKey('A', 0)?.percentage).toBeCloseTo(0.5, 12);
    expect(byKey('B', 0)?.percentage).toBeCloseTo(0.1, 12);
    expect(byKey('A', 5)?.percentage).toBeCloseTo(0.4, 12);
    expect(byKey('B', 5)?.percentage).toBeCloseTo(0, 12);
  });

  test('groupField (multi) aggregates by composite key and preserves includeValues', () => {
    const data = [
      { a: 'x', b: 'p', v: 1, w: 2 },
      { a: 'x', b: 'p', v: 2, w: 3 },
      { a: 'x', b: 'p', v: 7, w: 3 },
      { a: 'x', b: 'q', v: 1, w: 1 },
      { a: 'x', b: 'q', v: 2, w: 1 },
      { a: 'x', b: 'q', v: 3, w: 1 },
      { a: 'x', b: 'q', v: 8, w: 1 }
    ];
    const out: any = bin(data, {
      field: 'v',
      thresholds: [0, 5, 10],
      countField: 'w',
      groupField: ['a', 'b'],
      includeValues: false
    });
    expect(out.length).toBe(4);
    expect(out[0]).toMatchObject({ a: 'x', b: 'p', x0: 0, x1: 5, count: 5 });
    expect(out[1]).toMatchObject({ a: 'x', b: 'q', x0: 0, x1: 5, count: 3 });
    expect(out[2]).toMatchObject({ a: 'x', b: 'p', x0: 5, x1: 10, count: 3 });
    expect(out[3]).toMatchObject({ a: 'x', b: 'q', x0: 5, x1: 10, count: 1 });
    expect(out[0].percentage).toBeCloseTo(0.4166666666666667, 12);
    expect(out[1].percentage).toBeCloseTo(0.25, 12);
    expect(out[2].percentage).toBeCloseTo(0.25, 12);
    expect(out[3].percentage).toBeCloseTo(0.08333333333333333, 12);
  });

  test('bins prefer integer thresholds when range > 1', () => {
    // create data with min ~1.2 and max ~10.7 -> range > 1
    const data = [{ v: 1.2 }, { v: 2.5 }, { v: 5.0 }, { v: 10.7 }];
    const out: any = bin(data, { field: 'v', bins: 3 });
    // expect thresholds to start at floor(min)=1 and use integer step ceil((max-start)/bins)=4
    // thresholds -> [1, 5, 9, 13]
    expect(out.length).toBe(3);
    expect(out[0].x0).toBeCloseTo(1, 12);
    expect(out[1].x0).toBeCloseTo(5, 12);
    expect(out[2].x0).toBeCloseTo(9, 12);
    // last x1 should be the actual max
    expect(out[2].x1).toBeCloseTo(13, 12);
  });

  test('subView without groupField', () => {
    const data = [
      { v: 1, type: 'A' },
      { v: 2, type: 'A' },
      { v: 3, type: 'A' },
      { v: 4, type: 'B' },
      { v: 5, type: 'B' },
      { v: 6, type: 'B' }
    ];
    const out: any = bin(data, { field: 'v', bins: 3, facetField: 'type' });
    expect(out.length).toBe(6);
    expect(out[0].x0).toBeCloseTo(1, 12);
    expect(out[0].x1).toBeCloseTo(3, 12);
    expect(out[0].type).toBe('A');
    expect(out[0].percentage).toBeCloseTo(2 / 3, 12);

    expect(out[1].x0).toBeCloseTo(3, 12);
    expect(out[1].x1).toBeCloseTo(5, 12);
    expect(out[1].type).toBe('A');
    expect(out[1].percentage).toBeCloseTo(1 / 3, 12);

    expect(out[2].x0).toBeCloseTo(5, 12);
    expect(out[2].x1).toBeCloseTo(7, 12);
    expect(out[2].type).toBe('A');
    expect(out[2].percentage).toBeCloseTo(0, 12);

    expect(out[3].x0).toBeCloseTo(1, 12);
    expect(out[3].x1).toBeCloseTo(3, 12);
    expect(out[3].type).toBe('B');
    expect(out[3].percentage).toBeCloseTo(0, 12);

    expect(out[4].x0).toBeCloseTo(3, 12);
    expect(out[4].x1).toBeCloseTo(5, 12);
    expect(out[4].type).toBe('B');
    expect(out[4].percentage).toBeCloseTo(1 / 3, 12);

    expect(out[5].x0).toBeCloseTo(5, 12);
    expect(out[5].x1).toBeCloseTo(7, 12);
    expect(out[5].type).toBe('B');
    expect(out[5].percentage).toBeCloseTo(2 / 3, 12);
  });
  test('subView with groupField keeps full bins per combination', () => {
    const data = [
      { v: 1, type: 'A', group: 'china' },
      { v: 2, type: 'A', group: 'china' },
      { v: 3, type: 'A', group: 'china' },
      { v: 4, type: 'B', group: 'china' },
      { v: 5, type: 'B', group: 'china' },
      { v: 6, type: 'B', group: 'china' },
      { v: 1, type: 'A', group: 'usa' },
      { v: 2, type: 'A', group: 'usa' },
      { v: 3, type: 'A', group: 'usa' },
      { v: 4, type: 'B', group: 'usa' },
      { v: 5, type: 'B', group: 'usa' },
      { v: 6, type: 'B', group: 'usa' }
    ];
    const out: any = bin(data, { field: 'v', bins: 3, facetField: 'type', groupField: 'group' });
    // 2 types * 2 groups * 3 bins
    expect(out.length).toBe(12);
    const grouped: Record<string, any[]> = {};
    for (const item of out) {
      const key = `${item.type}-${item.group}`;
      grouped[key] = grouped[key] || [];
      grouped[key].push(item);
    }
    const expectedBins = [
      { x0: 1, x1: 3 },
      { x0: 3, x1: 5 },
      { x0: 5, x1: 7 }
    ];
    for (const binsForCombo of Object.values(grouped)) {
      expect(binsForCombo.length).toBe(3);
      binsForCombo.sort((a, b) => a.x0 - b.x0);
      binsForCombo.forEach((binItem, idx) => {
        expect(binItem.x0).toBeCloseTo(expectedBins[idx].x0, 12);
        expect(binItem.x1).toBeCloseTo(expectedBins[idx].x1, 12);
      });
    }
  });
});
