"use client";

import { Suspense, useLayoutEffect, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { getDetailProductScreenPx, getWorldScaleForScreenPx } from "@/lib/productDisplay";
import { configureRenderer } from "@/lib/configureRenderer";
import { hideEmbeddedProductBackdrops, polishJewelryMaterials, removeProductBackgroundTextures } from "@/lib/polishJewelryMaterials";
import { getJewelryPlacementBox } from "@/lib/tableSurface";
import BoutiqueEnvironment from "../BoutiqueEnvironment";

interface ProductViewerProps {
  glbPath: string;
}

function ProductModel({ glbPath }: { glbPath: string }) {
  const { scene } = useGLTF(glbPath);
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const fitRef = useRef(1);
  const centerRef = useRef(new THREE.Vector3());
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    hideEmbeddedProductBackdrops(scene);
    removeProductBackgroundTextures(scene);
    polishJewelryMaterials(scene);

    const jewelryBox = getJewelryPlacementBox(scene);
    const modelSize = jewelryBox.getSize(new THREE.Vector3());
    centerRef.current = jewelryBox.getCenter(new THREE.Vector3());
    fitRef.current = Math.max(modelSize.x, modelSize.y, modelSize.z);

    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [scene]);

  useLayoutEffect(() => {
    if (!innerRef.current) return;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const worldPos = new THREE.Vector3(0, 0, 0);
    const targetPx = getDetailProductScreenPx(size.width);
    const scale = getWorldScaleForScreenPx(
      camera,
      worldPos,
      fitRef.current,
      size.height,
      targetPx,
    );

    innerRef.current.position.set(-centerRef.current.x, -centerRef.current.y, -centerRef.current.z);
    innerRef.current.scale.setScalar(scale);
  }, [camera, scene, size.height, size.width]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.012;
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

function ProductCamera() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.position.set(0, 0.08, 3.1);
    camera.fov = size.width < 640 ? 28 : 26;
    camera.near = 0.1;
    camera.far = 100;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width]);

  return <PerspectiveCamera makeDefault position={[0, 0.08, 3.1]} fov={26} near={0.1} far={100} />;
}

function ProductControls() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const draggingRef = useRef(false);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(0, 0, 0);
    if (!draggingRef.current) {
      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + delta * 0.12);
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={1.8}
      maxDistance={5.2}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
      minPolarAngle={Math.PI * 0.22}
      maxPolarAngle={Math.PI * 0.78}
      onStart={() => {
        draggingRef.current = true;
      }}
      onEnd={() => {
        draggingRef.current = false;
      }}
    />
  );
}

function DeferredDetailEnvironment() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const run = () => setEnabled(true);
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(run, { timeout: 1800 });
      return () => cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 1400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <BoutiqueEnvironment variant="lobby" environmentIntensity={0.68} />
    </Suspense>
  );
}

function ProductScene({ glbPath }: { glbPath: string }) {
  return (
    <>
      <ProductCamera />
      <ProductControls />

      <ambientLight intensity={0.58} color="#FAF0E4" />
      <hemisphereLight args={["#FFF8F0", "#C9A27D", 0.38]} />

      <directionalLight position={[1.2, 4.5, 3.8]} intensity={1.1} color="#F3E2C8" />
      <directionalLight position={[-2.4, 2.8, 2.2]} intensity={0.34} color="#E8D0B0" />
      <directionalLight position={[2.2, 2.4, 1.6]} intensity={0.28} color="#F0DFC4" />

      <spotLight
        position={[0, 3.8, 2.6]}
        angle={0.42}
        penumbra={0.9}
        intensity={1.05}
        color="#E8C99A"
        distance={14}
      />
      <pointLight position={[0, 1.6, 2.4]} intensity={0.42} color="#E6C896" distance={9} />

      <Suspense fallback={null}>
        <ProductModel glbPath={glbPath} />
      </Suspense>

      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.12}
        scale={4.2}
        blur={3}
        far={2.8}
        color="#8A6B45"
      />

      <DeferredDetailEnvironment />
    </>
  );
}

export default function ProductViewer({ glbPath }: ProductViewerProps) {
  useGLTF.preload(glbPath);

  return (
    <Canvas
      dpr={[1, 1.2]}
      className="h-full w-full touch-none"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        configureRenderer(gl, { exposure: 1.12 });
      }}
    >
      <ProductScene glbPath={glbPath} />
    </Canvas>
  );
}
