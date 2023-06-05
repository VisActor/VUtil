import { variance } from './variance';

export function deviation(values: any[], valueof?: (entry: any, index?: number, arr?: any[]) => number) {
  const v = variance(values, valueof);
  return v ? Math.sqrt(v) : v;
}
