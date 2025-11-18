import boxplot from '../src/transform/boxplot';

describe('boxplot transform', () => {
  test('no grouping returns single summary', () => {
    const data = [{ v: 1 }, { v: 2 }, { v: 3 }];
    const out: any = boxplot(data as any[], { field: 'v' });
    expect(Array.isArray(out)).toBeTruthy();
    expect(out.length).toBe(1);
    const o = out[0];
    expect(o.count).toBe(3);
    expect(o.mean).toBeCloseTo(2, 12);
    expect(o.min).toBe(1);
    expect(o.max).toBe(3);
  });

  test('single-field grouping uses field name as key and groups correctly', () => {
    const data = [
      { g: 'x', v: 1 },
      { g: 'y', v: 10 },
      { g: 'x', v: 2 }
    ];
    const out: any = boxplot(data as any[], { field: 'v', groupField: 'g' });
    // two groups: x and y
    expect(out.length).toBe(2);
    const gx = out.find((it: any) => it.g === 'x');
    const gy = out.find((it: any) => it.g === 'y');
    expect(gx).toBeDefined();
    expect(gx.count).toBe(2);
    expect(gy).toBeDefined();
    expect(gy.count).toBe(1);
  });

  test('multi-field grouping copies fields to top-level when outputNames.key not provided', () => {
    const data = [
      { a: 'x', b: 'p', v: 1 },
      { a: 'x', b: 'p', v: 2 },
      { a: 'x', b: 'q', v: 3 }
    ];
    const out: any = boxplot(data as any[], { field: 'v', groupField: ['a', 'b'] });
    // expect two groups: (x,p) and (x,q)
    expect(out.length).toBe(2);
    // each output should have top-level a and b properties
    for (const o of out) {
      expect(o).toHaveProperty('a');
      expect(o).toHaveProperty('b');
    }
    const ap = out.find((it: any) => it.a === 'x' && it.b === 'p');
    const aq = out.find((it: any) => it.a === 'x' && it.b === 'q');
    expect(ap).toBeDefined();
    expect(ap.count).toBe(2);
    expect(aq).toBeDefined();
    expect(aq.count).toBe(1);
  });

  test('multi-field grouping with outputNames.key provided uses that key as object', () => {
    const data = [
      { a: 'x', b: 'p', v: 1 },
      { a: 'x', b: 'p', v: 2 }
    ];
    const out: any = boxplot(data as any[], { field: 'v', groupField: ['a', 'b'], outputNames: { key: 'group' } });
    expect(out.length).toBe(1);
    const o = out[0];
    // should have 'group' object and not top-level 'a' and 'b'
    expect(o).toHaveProperty('group');
    expect(o.group).toEqual({ a: 'x', b: 'p' });
    expect(o).not.toHaveProperty('a');
    expect(o).not.toHaveProperty('b');
  });

  test('includeValues returns original records in values field', () => {
    const data = [
      { g: 'x', v: 1, id: 'a' },
      { g: 'x', v: 2, id: 'b' }
    ];
    const out: any = boxplot(data as any[], { field: 'v', groupField: 'g', includeValues: true });
    expect(out.length).toBe(1);
    const o = out[0];
    expect(Array.isArray(o.values)).toBeTruthy();
    const ids = o.values.map((it: any) => it.id);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
  });

  test('whisker should be fixed not ranged by latset value', () => {
    const data = [
      {
        v: -1
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 3
      },
      {
        v: 4
      },
      {
        v: 4
      },
      {
        v: 7
      },
      {
        v: 8
      },
      {
        v: 9
      },
      {
        v: 10
      }
    ];
    const out: any = boxplot(data, { field: 'v' });
    expect(out.length).toBe(1);
    const o = out[0];
    expect(o.lowerWhisker).toBe(1.5);
    expect(o.upperWhisker).toBe(5.5);
  });
});
