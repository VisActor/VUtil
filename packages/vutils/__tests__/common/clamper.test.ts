import { clamper } from '../../src';

describe('clamper', () => {
  it('clamper(1, 100)', () => {
    const clamp = clamper(1, 100);
    expect(clamp(-1)).toBe(1);
    expect(clamp(120)).toBe(100);
    expect(clamp(50)).toBe(50);
  });

  it('clamper(100, 1)', () => {
    const clamp = clamper(100, 1);
    expect(clamp(-1)).toBe(1);
    expect(clamp(120)).toBe(100);
    expect(clamp(50)).toBe(50);
  });

  it('clamper(100, NaN)', () => {
    const clamp = clamper(100, NaN);
    expect(clamp(-1)).toBe(NaN);
    expect(clamp(120)).toBe(NaN);
    expect(clamp(50)).toBe(NaN);
  });
});
