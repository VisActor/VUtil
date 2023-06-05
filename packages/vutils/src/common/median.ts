import { ascending } from './ascending';
import { quantileSorted } from './quantileSorted';

export const median = (values: number[], isSorted?: boolean) => {
  let sorted = values;
  if (isSorted !== true) {
    sorted = values.sort(ascending);
  }

  return quantileSorted(sorted, 0.5);
};
