/** Smooth luxury easing for door motion — slow start, confident finish. */
export function easeOutCubic(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - clamped, 3);
}

/** Premium auto-door curve — responsive start, velvet stop. */
export function easeLuxuryOpen(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3.6);
}
