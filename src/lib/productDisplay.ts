import type * as THREE from "three";
import { PRODUCT_PATHS as PRODUCT_PATHS_FROM_DATA } from "@/data/products";

export const PRODUCT_PATHS = PRODUCT_PATHS_FROM_DATA;

export const PRODUCT_SCREEN_PX = 130;

export function getProductScreenPx(): number {
  return PRODUCT_SCREEN_PX;
}

export function getDetailProductScreenPx(width: number): number {
  if (width < 640) return 220; // mobile
  if (width < 1024) return 280; // tablet
  return 360; // desktop
}

/** Hover 10px above the glass table surface */
export const PRODUCT_TABLE_LIFT_PX = 10;
/** Forward offset on glass */
export const PRODUCT_TABLE_Z = 0.006;

/** Spacing across the curved display bays */
export const PRODUCT_X_OFFSETS = [-0.26, -0.13, 0, 0.13, 0.26] as const;

export const PRODUCT_DETAIL_SCREEN_PX = 250;
export const PRODUCT_HOVER_LIFT_PX = 32;
export const PRODUCT_HOVER_SCALE = 1.14;

export function getWorldSizeForScreenPx(
  camera: THREE.PerspectiveCamera,
  worldPosition: THREE.Vector3,
  canvasHeight: number,
  targetPx: number,
) {
  if (canvasHeight <= 0 || targetPx <= 0) return 1;

  const distance = camera.position.distanceTo(worldPosition);
  const worldScreenHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance;
  const worldPerPixel = worldScreenHeight / canvasHeight;
  return targetPx * worldPerPixel;
}

export function getWorldScaleForScreenPx(
  camera: THREE.PerspectiveCamera,
  worldPosition: THREE.Vector3,
  modelMaxDimension: number,
  canvasHeight: number,
  targetPx = PRODUCT_SCREEN_PX,
) {
  if (modelMaxDimension <= 0) return 1;
  return getWorldSizeForScreenPx(camera, worldPosition, canvasHeight, targetPx) / modelMaxDimension;
}
