import { findBoundaryAngles, normalizeAngle, polarToCartesian, calculateMaxRadius } from '../src';

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

  it('polarToCartesian', () => {
    expect(polarToCartesian({ x: 0, y: 0 }, undefined, undefined)).toEqual({ x: 0, y: 0 });
  });

  it('findBoundaryAngles', () => {
    expect(findBoundaryAngles(Math.PI / 4, Math.PI)).toEqual([Math.PI / 4, Math.PI, Math.PI / 2]);
    expect(findBoundaryAngles(Math.PI / 4, 1.5 * Math.PI)).toEqual([Math.PI / 4, 1.5 * Math.PI, Math.PI / 2, Math.PI]);
    expect(findBoundaryAngles(Math.PI / 4, 3 * Math.PI)).toEqual([0, Math.PI / 2, Math.PI, 1.5 * Math.PI]);

    expect(findBoundaryAngles(-Math.PI, -Math.PI / 4)).toEqual([Math.PI, 1.75 * Math.PI, 1.5 * Math.PI]);

    expect(findBoundaryAngles(-0.2 * Math.PI, -0.8 * Math.PI)).toEqual([1.2 * Math.PI, 1.8 * Math.PI, 1.5 * Math.PI]);
  });

  it('calculateMaxRadius', () => {
    expect(
      calculateMaxRadius({ width: 400, height: 300 }, { x: 200, y: 120 }, -1.25 * Math.PI, 0.25 * Math.PI)
    ).toBeCloseTo(120);
    expect(
      calculateMaxRadius({ width: 400, height: 300 }, { x: 200, y: 200 }, -1.25 * Math.PI, 0.25 * Math.PI)
    ).toBeCloseTo(141.42135623730948);

    expect(
      calculateMaxRadius({ width: 400, height: 500 }, { x: 200, y: 150 }, -0.8 * Math.PI, 0.1 * Math.PI)
    ).toBeCloseTo(150);
    expect(
      calculateMaxRadius({ width: 400, height: 500 }, { x: 200, y: 350 }, -0.8 * Math.PI, 0.1 * Math.PI)
    ).toBeCloseTo(157.71933363574007);
  });
});
