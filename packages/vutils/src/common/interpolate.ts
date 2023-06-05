export function interpolateNumber(a: number, b: number): (x: number) => number {
  return (t: number) => {
    return a * (1 - t) + b * t;
  };
}

export function interpolateNumberRound(a: number, b: number): (x: number) => number {
  return function (t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

export function interpolateDate(a: Date, b: Date) {
  const aVal = a.valueOf();
  const bVal = b.valueOf();

  const d = new Date();
  return (t: number) => {
    d.setTime(aVal * (1 - t) + bVal * t);
    return d;
  };
}

const reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
const reB = new RegExp(reA.source, 'g');

function zero(b: any) {
  return function () {
    return b;
  };
}

function one(b: any) {
  return function (t: any) {
    return b(t) + '';
  };
}

export function interpolateString(a: any, b: any) {
  let bi = (reA.lastIndex = reB.lastIndex = 0); // scan index for next number in b
  let am: any; // current match in a
  let bm: any; // current match in b
  let bs; // string preceding current number in b, if any
  let i = -1; // index in s
  const s: any[] = []; // string constants and placeholders
  const q: any[] = []; // number interpolators

  // Coerce inputs to strings.
  (a = a + ''), (b = b + '');

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) {
        s[i] += bs;
      } // coalesce with previous string
      else {
        s[++i] = bs;
      }
    }
    if ((am = am[0]) === (bm = bm[0])) {
      // numbers in a & b match
      if (s[i]) {
        s[i] += bm;
      } // coalesce with previous string
      else {
        s[++i] = bm;
      }
    } else {
      // interpolate non-matching numbers
      s[++i] = null;
      q.push({ i: i, x: interpolateNumber(am, bm) });
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) {
      s[i] += bs;
    } // coalesce with previous string
    else {
      s[++i] = bs;
    }
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2
    ? q[0]
      ? one(q[0].x)
      : zero(b)
    : ((b = q.length),
      function (t: any) {
        for (let i = 0, o; i < b; ++i) {
          s[(o = q[i]).i] = o.x(t);
        }
        return s.join('');
      });
}
