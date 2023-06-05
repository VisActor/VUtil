const clampRange = (range: [number, number], min: number, max: number): [number, number] => {
  let [lowValue, highValue] = range;

  if (highValue < lowValue) {
    lowValue = range[1];
    highValue = range[0];
  }
  const span = highValue - lowValue;

  if (span >= max - min) {
    return [min, max];
  }

  lowValue = Math.min(Math.max(lowValue, min), max - span);

  return [lowValue, lowValue + span];
};

export default clampRange;
