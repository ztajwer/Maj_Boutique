/** Hover transition duration — matches CSS product cards (420ms ease-out). */
export const HOVER_DURATION_S = 0.42;

export function easeOutCubic(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return 1 - (1 - c) ** 3;
}

export function stepToward(current: number, target: number, delta: number, durationS = HOVER_DURATION_S) {
  const step = delta / durationS;
  if (target > current) return Math.min(target, current + step);
  return Math.max(target, current - step);
}
