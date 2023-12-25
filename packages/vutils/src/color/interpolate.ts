import { RGB } from './rgb';

export function interpolateRgb(colorA: RGB, colorB: RGB): (x: number) => RGB {
  const redA = colorA.r;
  const redB = colorB.r;
  const greenA = colorA.g;
  const greenB = colorB.g;
  const blueA = colorA.b;
  const blueB = colorB.b;
  const opacityA = colorA.opacity;
  const opacityB = colorB.opacity;

  return (t: number) => {
    const r = Math.round(redA * (1 - t) + redB * t);
    const g = Math.round(greenA * (1 - t) + greenB * t);
    const b = Math.round(blueA * (1 - t) + blueB * t);
    const opacity = opacityA * (1 - t) + opacityB * t;

    return new RGB(r, g, b, opacity);
  };
}
