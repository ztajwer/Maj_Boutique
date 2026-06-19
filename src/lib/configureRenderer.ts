import type { WebGLRenderer } from "three";
import * as THREE from "three";
import { getMaxCanvasDpr } from "./device";

/** Consistent color pipeline across Chrome, Safari, Firefox, Edge. */
export function configureRenderer(
  gl: WebGLRenderer,
  options?: { exposure?: number; clearColor?: number; clearAlpha?: number },
) {
  gl.setPixelRatio(getMaxCanvasDpr());
  gl.setClearColor(options?.clearColor ?? 0x000000, options?.clearAlpha ?? 0);
  gl.shadowMap.enabled = false;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = options?.exposure ?? 1.08;
  gl.outputColorSpace = THREE.SRGBColorSpace;
}
