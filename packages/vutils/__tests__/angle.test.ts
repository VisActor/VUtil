import { normalizeAngle } from '../src';

describe('angle utils', () => {
  it('normalizeAngle', () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(Math.PI)).toBe(Math.PI);
    expect(normalizeAngle(2 * Math.PI)).toBe(0);
    expect(normalizeAngle(6.28)).toBe(6.28);
    expect(normalizeAngle(3 * Math.PI)).toBe(Math.PI);
    expect(normalizeAngle(4 * Math.PI)).toBe(0);
    expect(normalizeAngle(-2 * Math.PI)).toBe(0);
    expect(normalizeAngle(-Math.PI)).toBe(Math.PI);
  });
});
