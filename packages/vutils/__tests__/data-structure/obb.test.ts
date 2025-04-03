import { IOBBBounds, OBBBounds, obbSeparation } from '../../src/index';

describe('OBBBounds', () => {
  it('clone of OBBBounds', () => {
    const a = new OBBBounds();
    a.setValue(10, 10, 100, 100, Math.PI / 4);
    const b = a.clone();

    expect(a.x1).toBe(b.x1);
    expect(a.x2).toBe(b.x2);
    expect(a.y1).toBe(b.y1);
    expect(a.y2).toBe(b.y2);
    expect(a.angle).toBe(b.angle);
  });

  it('distance of OBBBounds (simulation for xAxis label)', () => {
    const a = new OBBBounds();
    a.setValue(0, 0, 100, 20, Math.PI / 4);
    const b = new OBBBounds();
    b.setValue(0, 0, 100, 20, Math.PI / 4);
    b.translate(100, 0);
    expect(obbSeparation(a as any as IOBBBounds, b as any as IOBBBounds)).toBeCloseTo(100 / Math.sqrt(2) - 20);
  });

  it('distance of OBBBounds (simulation for yAxis labels', () => {
    const a = new OBBBounds();
    a.setValue(0, 0, 100, 20, Math.PI / 6);
    const b = new OBBBounds();
    b.setValue(0, 0, 100, 20, Math.PI / 6);
    b.translate(0, 100);
    expect(obbSeparation(a as any as IOBBBounds, b as any as IOBBBounds)).toBeCloseTo((100 / 2) * Math.sqrt(3) - 20);
  });
});
