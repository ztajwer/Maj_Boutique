/** Safari (desktop + iOS) — not Chrome/Firefox/Edge on Apple platforms. */
export function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|OPR|OPiOS/i.test(ua);
}

export function getMaxCanvasDpr(): number {
  if (typeof window === "undefined") return 1;
  const ratio = window.devicePixelRatio || 1;
  return isSafari() ? Math.min(ratio, 1) : Math.min(ratio, 1.25);
}

export function getCanvasDprRange(): [number, number] {
  const max = getMaxCanvasDpr();
  return [1, max];
}
