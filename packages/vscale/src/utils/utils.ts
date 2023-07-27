import { bisect } from '@visactor/vutils';
import type { FloorCeilType, InterpolateType } from '../interface';

export function identity(x: any) {
  return x;
}

export const generatePow = (exponent: number) => {
  return (x: number) => {
    return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
  };
};

export const sqrt = (x: number) => {
  return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
};

export const square = (x: number) => {
  return x < 0 ? -x * x : x * x;
};

export const log = (x: number) => {
  return Math.log(x);
};

export const exp = (x: number) => {
  return Math.exp(x);
};

export const logNegative = (x: number) => {
  return -Math.log(-x);
};

export const expNegative = (x: number) => {
  return -Math.exp(-x);
};

export const pow10 = (x: number) => {
  return isFinite(x) ? Math.pow(10, x) : x < 0 ? 0 : x;
};

export const powp = (base: number) => {
  return base === 10 ? pow10 : base === Math.E ? Math.exp : (x: number) => Math.pow(base, x);
};

export const logp = (base: number) => {
  return base === Math.E
    ? Math.log
    : base === 10
    ? Math.log10
    : base === 2
    ? Math.log2
    : ((base = Math.log(base)), (x: number) => Math.log(x) / base);
};

export const symlog = (c: number) => {
  return (x: number) => {
    return Math.sign(x) * Math.log1p(Math.abs(x / c));
  };
};

export const symexp = (c: number) => {
  return (x: number) => {
    return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
  };
};

export function normalize(a: number, b: number): (x: number) => number {
  a = Number(a);
  b = Number(b);
  b -= a;
  if (b) {
    return (x: number) => {
      return (x - a) / b;
    };
  }
  const result = Number.isNaN(b) ? NaN : 0.5;
  return () => {
    return result;
  };
}

// 基于d3-scale
// https://github.com/d3/d3-scale/blob/main/src/continuous.js
// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
export function bimap(
  domain: [number, number],
  range: [any, any],
  interpolate: InterpolateType<any>
): (x: number) => any {
  const d0 = domain[0];
  const d1 = domain[1];
  const r0 = range[0];
  const r1 = range[1];
  let d0Fuc: any;
  let r0Fuc: any;
  if (d1 < d0) {
    d0Fuc = normalize(d1, d0);
    r0Fuc = interpolate(r1, r0);
  } else {
    d0Fuc = normalize(d0, d1);
    r0Fuc = interpolate(r0, r1);
  }
  return (x: number) => {
    return r0Fuc(d0Fuc(x));
  };
}

export function bandSpace(count: number, paddingInner: number, paddingOuter: number): number {
  let space;
  // count 等于 1 时需要特殊处理，否则 step 会超出 range 范围
  // 计算公式: step = paddingOuter * step * 2 + paddingInner * step + bandwidth
  if (count === 1) {
    space = count + paddingOuter * 2;
  } else {
    space = count - paddingInner + paddingOuter * 2;
  }
  return count ? (space > 0 ? space : 1) : 0;
}

export function scaleWholeLength(count: number, bandwidth: number, paddingInner: number, paddingOuter: number) {
  const space = bandSpace(count, paddingInner, paddingOuter);
  const step = bandwidth / (1 - paddingInner);
  const wholeLength = space * step;
  return wholeLength;
}

export function polymap(domain: number[], range: any[], interpolate: InterpolateType<any>): (x: number) => any {
  const j = Math.min(domain.length, range.length) - 1;
  const d = new Array(j);
  const r = new Array(j);
  let i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }

  return function (x: number) {
    const i = bisect(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

export const nice = (domain: number[] | Date[], options: FloorCeilType<any>) => {
  const newDomain = domain.slice();

  let startIndex = 0;
  let endIndex = newDomain.length - 1;
  let x0 = newDomain[startIndex];
  let x1 = newDomain[endIndex];

  if (x1 < x0) {
    [startIndex, endIndex] = [endIndex, startIndex];
    [x0, x1] = [x1, x0];
  }

  newDomain[startIndex] = options.floor(x0);
  newDomain[endIndex] = options.ceil(x1);

  return newDomain;
};

export const niceNumber = (value: number, round: boolean = false) => {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);

  let niceFraction: number;

  if (round) {
    if (fraction < 1.5) {
      niceFraction = 1;
    } else if (fraction < 3) {
      niceFraction = 2;
    } else if (fraction < 7) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  } else {
    if (fraction <= 1) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  }

  return niceFraction * Math.pow(10, exponent);
};

export const restrictNumber = (value: number, domain: [number, number]) => {
  let min;
  let max;
  if (domain[0] < domain[1]) {
    min = domain[0];
    max = domain[1];
  } else {
    min = domain[1];
    max = domain[0];
  }
  return Math.min(Math.max(value, min), max);
};
