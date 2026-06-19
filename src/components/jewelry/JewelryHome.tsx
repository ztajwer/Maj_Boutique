"use client";

import { Suspense, lazy, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, PerspectiveCamera, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  TABLE_DISPLAY,
  getTableCamera,
  getOrbitTarget,
  getTableOffsetX,
  getTableScale,
  getTableTarget,
  getFrontPolar,
} from "@/lib/tableDisplay";
import { applyTextureColorSpace } from "@/lib/polishJewelryMaterials";
import { PRODUCT_X_OFFSETS } from "@/lib/productDisplay";
import { measureTableSurfaceAnchors, type TableSurfaceAnchor } from "@/lib/tableSurface";
import { configureRenderer } from "@/lib/configureRenderer";
import { getCanvasDprRange, isSafari } from "@/lib/device";
import BoutiqueEnvironment from "../BoutiqueEnvironment";

const TableProducts = lazy(() => import("./TableProducts"));

useGLTF.preload("/table-3d.glb");

const TABLE_SHADE = new THREE.Color("#C9A27D");
const TABLE_LIGHTEN = new THREE.Color("#E8D2B4");

function materialLuminance(color: THREE.Color) {
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
}

function polishTableMaterials(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
        applyTextureColorSpace(mat);
        const lum = materialLuminance(mat.color);
        const shadeStrength = lum < 0.18 ? 0.58 : lum < 0.45 ? 0.48 : 0.34;
        mat.color.lerp(TABLE_SHADE, shadeStrength);
        mat.color.lerp(TABLE_LIGHTEN, 0.22);
        mat.envMapIntensity = 1.18;
        mat.metalness = THREE.MathUtils.clamp(mat.metalness + 0.06, 0.3, 0.62);
        mat.roughness = THREE.MathUtils.clamp(mat.roughness + 0.02, 0.26, 0.5);
        mat.needsUpdate = true;
      }
    });
  });
}

function ResponsiveCamera() {
  const { size, camera } = useThree();
  const cam = getTableCamera(size.width, size.height);
  const target = getOrbitTarget();
  const [camX, camY, camZ] = cam.position;

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.position.set(camX, camY, camZ);
    camera.fov = cam.fov;
    camera.near = 0.1;
    camera.far = 100;
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [camera, camX, camY, camZ, cam.fov, target]);

  return <PerspectiveCamera makeDefault position={cam.position} fov={cam.fov} near={0.1} far={100} />;
}

function hideTableMannequins(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = mesh.name.toLowerCase();
    if (/bust|mannequin|dummy|neck_?form|display_?form|standee|jewelry_?stand|head_?form/.test(name)) {
      mesh.visible = false;
    }
  });
}

function TableModel() {
  const { scene } = useGLTF("/table-3d.glb");
  const tableRootRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const fitRef = useRef(1);
  const centerRef = useRef(new THREE.Vector3());
  const boxRef = useRef(new THREE.Box3());
  const [anchors, setAnchors] = useState<TableSurfaceAnchor[] | null>(null);
  const [surfaceY, setSurfaceY] = useState(0);
  const { size } = useThree();
  const targetScale = getTableScale(size.width, size.height);
  const fallbackTarget = getTableTarget(size.width, size.height);
  const [centerY, setCenterY] = useState(fallbackTarget[1]);
  const offsetX = getTableOffsetX(size.width, size.height);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    boxRef.current = box;
    const modelSize = box.getSize(new THREE.Vector3());
    centerRef.current = box.getCenter(new THREE.Vector3());
    fitRef.current = Math.max(Math.max(modelSize.x, modelSize.z), modelSize.y * 0.74);
    hideTableMannequins(scene);
    polishTableMaterials(scene);
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.receiveShadow = true;
      mesh.castShadow = false;
    });
  }, [scene]);

  useLayoutEffect(() => {
    if (!innerRef.current || !tableRootRef.current) return;

    const uniformScale = targetScale / fitRef.current;
    innerRef.current.position.set(-centerRef.current.x, -centerRef.current.y, -centerRef.current.z);
    innerRef.current.scale.setScalar(uniformScale);
    innerRef.current.updateMatrixWorld(true);
    tableRootRef.current.updateMatrixWorld(true);

    const nextAnchors = measureTableSurfaceAnchors(scene, tableRootRef.current, PRODUCT_X_OFFSETS);
    const nextSurfaceY = nextAnchors.reduce((sum, anchor) => sum + anchor.y, 0) / nextAnchors.length;
    const nextCenterY = -0.12 - nextSurfaceY;

    setCenterY((current) => (current === nextCenterY ? current : nextCenterY));
    setSurfaceY((current) => (current === nextSurfaceY ? current : nextSurfaceY));

    setAnchors((current) => {
      if (
        current &&
        current.length === nextAnchors.length &&
        current.every(
          (anchor, index) =>
            anchor.x === nextAnchors[index].x &&
            anchor.y === nextAnchors[index].y &&
            anchor.z === nextAnchors[index].z,
        )
      ) {
        return current;
      }
      return nextAnchors;
    });
  }, [scene, targetScale, size.height, size.width]);

  return (
    <group ref={tableRootRef} position={[offsetX, centerY, 0]}>
      <group ref={innerRef} renderOrder={0}>
        <primitive object={scene} />
      </group>
      {anchors && (
        <group name="table-products-root">
          <ContactShadows
            position={[0, surfaceY + 0.0005, 0]}
            opacity={0.3}
            scale={7.5}
            blur={isSafari() ? 2.2 : 2.8}
            far={0.42}
            resolution={isSafari() ? 256 : 512}
            color="#3D2B1F"
          />
          <Suspense fallback={null}>
            <TableProducts anchors={anchors} tableRootRef={tableRootRef} />
          </Suspense>
        </group>
      )}
    </group>
  );
}

function TableDisplay() {
  return <TableModel />;
}

function RotateOnlyControls() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { size } = useThree();
  const target = getOrbitTarget();
  const polar = getFrontPolar(size.width, size.height);

  useLayoutEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(target[0], target[1], target[2]);
    controls.setAzimuthalAngle(TABLE_DISPLAY.frontAzimuth);
    controls.setPolarAngle(polar);
    controls.update();
  }, [target, polar]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(target[0], target[1], target[2]);
    controls.minPolarAngle = polar;
    controls.maxPolarAngle = polar;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={target}
      enableDamping
      dampingFactor={0.14}
      enablePan={false}
      enableZoom={false}
      screenSpacePanning={false}
      rotateSpeed={0.42}
      minPolarAngle={polar}
      maxPolarAngle={polar}
      mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.ROTATE }}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.ROTATE }}
    />
  );
}

function TableScene() {
  return (
    <>
      <ResponsiveCamera />
      <RotateOnlyControls />
      <ambientLight intensity={0.55} color="#FFFCF8" />
      <hemisphereLight args={["#FFFFFF", "#E8E0D8", 0.32]} />
      <directionalLight position={[0.5, 5.5, 4.8]} intensity={1.05} color="#FFF9F2" />
      <directionalLight position={[-2.2, 3, 2.2]} intensity={0.32} color="#F5F0EA" />
      <directionalLight position={[2.2, 2.8, 1.4]} intensity={0.28} color="#FFF8F2" />
      <Suspense fallback={null}>
        <BoutiqueEnvironment variant="apartment" environmentIntensity={0.55} />
      </Suspense>
      <TableDisplay />
    </>
  );
}

interface JewelryHomeProps {
  visible?: boolean;
}

export default function JewelryHome({ visible = true }: JewelryHomeProps) {
  return (
    <div
      className="h-full w-full"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.08s",
      }}
    >
      <Canvas
        dpr={getCanvasDprRange()}
        frameloop="always"
        className="h-full w-full"
        gl={{
          antialias: !isSafari(),
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        style={{ width: "100%", height: "100%", cursor: visible ? "grab" : "default" }}
        onCreated={({ gl }) => {
          configureRenderer(gl, { exposure: isSafari() ? 1.04 : 1.08 });
        }}
      >
        <Suspense fallback={null}>
          <TableScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
