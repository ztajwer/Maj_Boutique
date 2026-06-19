"use client";

import { Suspense, useLayoutEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { configureRenderer } from "@/lib/configureRenderer";
import { getJewelryPlacementBox } from "@/lib/tableSurface";
import {
  hideEmbeddedProductBackdrops,
  polishJewelryMaterials,
  removeProductBackgroundTextures,
} from "@/lib/polishJewelryMaterials";
import { PRODUCT_SIZE_PX } from "@/lib/shopLayout";

function ThumbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, size, invalidate } = useThree();

  useLayoutEffect(() => {
    hideEmbeddedProductBackdrops(scene);
    removeProductBackgroundTextures(scene);
    polishJewelryMaterials(scene);

    const jewelryBox = getJewelryPlacementBox(scene);
    const modelSize = jewelryBox.getSize(new THREE.Vector3());
    const center = jewelryBox.getCenter(new THREE.Vector3());
    const fit = Math.max(modelSize.y, 0.001);

    if (!(camera instanceof THREE.PerspectiveCamera) || !groupRef.current) return;

    const distance = 2.4;
    const worldHeight =
      2 * Math.tan((camera.fov * Math.PI) / 360) * distance * (PRODUCT_SIZE_PX / size.height);
    const scale = worldHeight / fit;

    groupRef.current.position.set(-center.x * scale, -jewelryBox.min.y * scale, -center.z * scale);
    groupRef.current.scale.setScalar(scale);
    invalidate();
  }, [camera, invalidate, scene, size.height]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export default function ProductThumbCanvas({ url }: { url: string }) {
  return (
    <Canvas
      className="product-thumb-canvas"
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.12, 2.4], fov: 28, near: 0.1, far: 20 }}
      onCreated={({ gl, invalidate }) => {
        configureRenderer(gl, { exposure: 1.05 });
        invalidate();
      }}
    >
      <ambientLight intensity={0.85} color="#FFFCF8" />
      <directionalLight position={[1.2, 2.4, 2]} intensity={1.1} color="#FFF8F0" />
      <directionalLight position={[-1.5, 1.2, 1]} intensity={0.35} color="#FFE8C0" />
      <Suspense fallback={null}>
        <ThumbModel url={url} />
      </Suspense>
    </Canvas>
  );
}
