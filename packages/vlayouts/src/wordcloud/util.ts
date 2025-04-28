import { isFunction } from '@visactor/vutils';

export function getMinFontSizeOfEnv() {
  return 12;
}

export const randomHslColor = (min: number, max: number) => {
  return (
    'hsl(' +
    (Math.random() * 360).toFixed() +
    ',' +
    (Math.random() * 30 + 70).toFixed() +
    '%,' +
    (Math.random() * (max - min) + min).toFixed() +
    '%)'
  );
};

export function functor(d: any) {
  return isFunction(d)
    ? d
    : function () {
        return d;
      };
}
