const clamp = function (input: number, min: number, max: number): number {
  if (input < min) {
    return min;
  } else if (input > max) {
    return max;
  }
  return input;
};

export default clamp;
