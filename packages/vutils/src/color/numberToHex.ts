export function hex(value: number) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? '0' : '') + value.toString(16);
}
