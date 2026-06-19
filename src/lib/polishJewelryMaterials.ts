import * as THREE from "three";

const WARM_HIGHLIGHT = new THREE.Color("#F5D98A");
const WARM_FILL = new THREE.Color("#FFF8F0");
const GOLD_ACCENT = new THREE.Color("#D4AF37");

function luminance(color: THREE.Color) {
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
}

function patchFragment(shader: { fragmentShader: string }, needle: string, replacement: string) {
  if (!shader.fragmentShader.includes(needle)) return false;
  shader.fragmentShader = shader.fragmentShader.replace(needle, replacement);
  return true;
}

/** Only color textures should be sRGB — Safari exaggerates wrong color space on metals. */
export function applyTextureColorSpace(
  mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
) {
  if (mat.map) {
    mat.map.colorSpace = THREE.SRGBColorSpace;
    mat.map.needsUpdate = true;
  }
  if (mat.emissiveMap) {
    mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
    mat.emissiveMap.needsUpdate = true;
  }
}

/** Hide baked-in display plates / backdrop meshes inside product GLBs. */
export function hideEmbeddedProductBackdrops(object: THREE.Object3D) {
  const rootBox = new THREE.Box3().setFromObject(object);
  const rootSize = rootBox.getSize(new THREE.Vector3());
  const rootHeight = Math.max(rootSize.y, 0.001);
  const rootMinY = rootBox.min.y;

  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const name = mesh.name.toLowerCase();
    if (
      /(?:^|_)(?:bg|background|backdrop|pro_?bg|shadow_?plane|display_?plate|display_?stand|platform|pedestal|card_?bg|product_?bg|turntable)(?:$|_)/.test(
        name,
      ) ||
      /^(plane|plate|disc)_?(?:bg|back)/.test(name)
    ) {
      mesh.visible = false;
      return;
    }

    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const thin = Math.min(size.x, size.y, size.z);
    const wide = Math.max(size.x, size.z);
    const tall = size.y;
    const nearFloor = (center.y - rootMinY) / rootHeight < 0.22;

    if (nearFloor && wide > 0 && thin / wide < 0.1 && wide > tall * 2.2) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const isMetal = mats.some(
        (mat) =>
          (mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial) &&
          mat.metalness > 0.35,
      );
      if (!isMetal) {
        mesh.visible = false;
      }
    }
  });
}

const MAJ_BG_CLIP_KEY = "maj-product-bg-clip-v4";

function installBackgroundClipShader(
  mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  hasColorMap: boolean,
) {
  if (mat.userData.majBgClipInstalled) return;
  mat.userData.majBgClipInstalled = true;

  const previousOnBeforeCompile = mat.onBeforeCompile;

  mat.onBeforeCompile = (shader, renderer) => {
    previousOnBeforeCompile?.call(mat, shader, renderer);

    if (!hasColorMap || shader.fragmentShader.includes("majBgClipLum")) return;

    patchFragment(
      shader,
      "#include <map_fragment>",
      `#include <map_fragment>
            #ifdef USE_MAP
              {
                float majBgClipLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
                float majBgClipSat = length(diffuseColor.rgb - vec3(majBgClipLum));
                if (majBgClipSat < 0.11 && majBgClipLum > 0.64) discard;
              }
            #endif`,
    );
  };

  mat.customProgramCacheKey = () => `${MAJ_BG_CLIP_KEY}-${hasColorMap ? "map" : "nomap"}`;
  mat.needsUpdate = true;
}

/** Remove baked product-card background textures from GLB materials. */
export function removeProductBackgroundTextures(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.visible) return;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      if (
        !(mat instanceof THREE.MeshStandardMaterial) &&
        !(mat instanceof THREE.MeshPhysicalMaterial)
      ) {
        return;
      }

      applyTextureColorSpace(mat);

      if (mat.emissiveMap) {
        mat.emissiveMap.dispose();
        mat.emissiveMap = null;
      }

      mat.alphaMap = null;
      mat.alphaTest = 0;
      mat.transparent = false;
      mat.depthWrite = true;
      mat.side = THREE.FrontSide;

      installBackgroundClipShader(mat, !!mat.map);
    });
  });
}

/** Rich, warm boutique look — consistent across Chrome/Safari/Firefox. */
export function polishJewelryMaterials(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      if (
        !(mat instanceof THREE.MeshStandardMaterial) &&
        !(mat instanceof THREE.MeshPhysicalMaterial)
      ) {
        return;
      }

      applyTextureColorSpace(mat);

      const lum = luminance(mat.color);
      const hsl = { h: 0, s: 0, l: 0 };
      mat.color.getHSL(hsl);

      if (lum < 0.22) {
        mat.color.lerp(WARM_FILL, 0.1);
        mat.color.multiplyScalar(1.22);
      } else if (lum < 0.5) {
        mat.color.lerp(GOLD_ACCENT, 0.14);
        mat.color.lerp(WARM_HIGHLIGHT, 0.06);
      } else {
        mat.color.lerp(WARM_HIGHLIGHT, 0.08);
      }

      const isMetal = mat.metalness > 0.35 || lum < 0.4;
      if (isMetal) {
        mat.metalness = THREE.MathUtils.clamp(mat.metalness + 0.14, 0.15, 1);
        mat.roughness = THREE.MathUtils.clamp(mat.roughness - 0.1, 0.1, 0.72);
        mat.envMapIntensity = 1.62;
      } else {
        mat.metalness = THREE.MathUtils.clamp(mat.metalness, 0, 0.55);
        mat.roughness = THREE.MathUtils.clamp(mat.roughness, 0.16, 0.62);
        mat.envMapIntensity = 1.45;
      }

      if (hsl.s > 0.28 && hsl.l < 0.62) {
        mat.emissive.copy(mat.color).multiplyScalar(0.08);
        mat.emissiveIntensity = 0.42;
      }

      mat.needsUpdate = true;
    });
  });
}
