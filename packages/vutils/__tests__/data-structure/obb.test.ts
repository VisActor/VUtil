import { OBBBounds } from '../../src/index';

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
});
