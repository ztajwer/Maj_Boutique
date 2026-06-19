/** Table — straight front view, exact bottom with small gap. */
import * as THREE from "three";

export const TABLE_DISPLAY = {
  scale: {
    mobile: 0.62,
    tablet: 0.66,
    desktop: 0.71,
  },
  /** Align table base with marble floor in background.png */
  bottomGapRatio: 0.108,
  /** Centered on the boutique floor */
  leftGapRatio: 0,
  /** World-space half-height estimate for bottom anchoring (scales with table). */
  tableHalfHeightFactor: 0.285,
  frontAzimuth: 0,
  camera: {
    mobile: { position: [0, 0.52, 3.0] as [number, number, number], fov: 27 },
    tablet: { position: [0, 0.50, 2.9] as [number, number, number], fov: 26 },
    desktop: { position: [0, 0.48, 2.7] as [number, number, number], fov: 25 },
  },
  floor: { radius: 0.95, yOffset: -0.05 },
  shadow: { scale: 3.8, opacity: 0.12, blur: 4 },
} as const;

export type TableBreakpoint = "mobile" | "tablet" | "desktop";

export function getTableBreakpoint(width: number): TableBreakpoint {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/** Orbit / look-at pivot — target the table surface. */
const ORBIT_TARGET: [number, number, number] = [0, -0.12, 0];

export function getOrbitTarget(): [number, number, number] {
  return ORBIT_TARGET;
}

/** Visible frustum size at the table depth. */
function getViewSize(width: number, height: number) {
  const cam = getTableCamera(width, height);
  const fovRad = (cam.fov * Math.PI) / 180;
  const viewHeight = 2 * Math.tan(fovRad / 2) * cam.position[2];
  const viewWidth = viewHeight * (width / Math.max(height, 1));
  return { viewHeight, viewWidth };
}

/** World Y of the bottom screen edge when the orbit target is at the origin. */
export function getTableBottomAnchor(width: number, height: number): number {
  const { viewHeight } = getViewSize(width, height);
  return -viewHeight * 0.5 + viewHeight * TABLE_DISPLAY.bottomGapRatio;
}

/** Slight negative X shifts the table a little left on screen. */
export function getTableOffsetX(width: number, height: number): number {
  const { viewWidth } = getViewSize(width, height);
  return -viewWidth * TABLE_DISPLAY.leftGapRatio;
}

/** Fallback table center before the GLB is measured. */
export function getTableTarget(width: number, height: number): [number, number, number] {
  const bottomY = getTableBottomAnchor(width, height);
  const halfHeight = getTableScale(width, height) * TABLE_DISPLAY.tableHalfHeightFactor;
  return [getTableOffsetX(width, height), bottomY + halfHeight, 0];
}

/** Locks a perfect straight front view to the orbit pivot. */
export function getFrontPolar(width: number, height: number) {
  const cam = getTableCamera(width, height);
  const target = getOrbitTarget();
  const dy = cam.position[1] - target[1];
  const dz = cam.position[2] - target[2];
  return Math.acos(THREE.MathUtils.clamp(dy / Math.hypot(dy, dz), -1, 1));
}

function getAspectScaleFactor(width: number, height: number) {
  const aspect = width / Math.max(height, 1);
  if (aspect >= 2.4) return 0.9;
  if (aspect >= 2) return 0.94;
  if (aspect >= 1.5) return 0.98;
  return 1;
}

function getAspectCameraFactor(width: number, height: number) {
  const aspect = width / Math.max(height, 1);
  if (aspect >= 2.4) return { z: 0.26, fov: 1.2 };
  if (aspect >= 2) return { z: 0.16, fov: 0.8 };
  if (aspect >= 1.5) return { z: 0.08, fov: 0.4 };
  return { z: 0, fov: 0 };
}

export function getTableScale(width: number, height = width) {
  const base = TABLE_DISPLAY.scale[getTableBreakpoint(width)];
  return base * getAspectScaleFactor(width, height);
}

export function getTableCamera(width: number, height = width) {
  const cam = TABLE_DISPLAY.camera[getTableBreakpoint(width)];
  const factor = getAspectCameraFactor(width, height);
  return {
    position: [cam.position[0], cam.position[1], cam.position[2] + factor.z] as [
      number,
      number,
      number,
    ],
    fov: cam.fov + factor.fov,
  };
}
