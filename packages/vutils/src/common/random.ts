export function seedRandom(seed: number) {
  return parseFloat('0.' + Math.sin(seed).toString().substring(6));
}
