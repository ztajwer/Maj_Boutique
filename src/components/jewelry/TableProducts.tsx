"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getProductBySlot, products } from "@/data/products";
import { isSafari } from "@/lib/device";
import { hideEmbeddedProductBackdrops, polishJewelryMaterials, removeProductBackgroundTextures } from "@/lib/polishJewelryMaterials";
import {
  PRODUCT_HOVER_LIFT_PX,
  PRODUCT_HOVER_SCALE,
  getProductScreenPx,
  PRODUCT_TABLE_LIFT_PX,
  PRODUCT_TABLE_Z,
  getWorldScaleForScreenPx,
  getWorldSizeForScreenPx,
} from "@/lib/productDisplay";
import { getJewelryPlacementBox, getVisibleBox, type TableSurfaceAnchor } from "@/lib/tableSurface";

const MAX_GLITTER = 48;
const SHADOW_COLOR = new THREE.Color("#3D2B1F");

function getGlitterCap() {
  return isSafari() ? 24 : MAX_GLITTER;
}

function ProductAnchorPulse({ anchor, lift }: { anchor: TableSurfaceAnchor; lift: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 2.4) * 0.2;
    ref.current.scale.setScalar(pulse);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.18 + Math.sin(state.clock.elapsedTime * 2.4) * 0.08;
  });

  return (
    <mesh ref={ref} position={[anchor.x, anchor.y + lift, anchor.z + PRODUCT_TABLE_Z]}>
      <ringGeometry args={[0.028, 0.042, 32]} />
      <meshBasicMaterial color="#D4AF37" transparent opacity={0.22} depthWrite={false} />
    </mesh>
  );
}

function ProductContactShadow({ radius, hoverRef }: { radius: number; hoverRef: RefObject<number> }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const hover = hoverRef.current ?? 0;
    const targetOpacity = THREE.MathUtils.lerp(0.22, 0.1, hover);
    mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 8, delta);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0]} renderOrder={5}>
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial ref={matRef} color={SHADOW_COLOR} transparent opacity={0.28} depthWrite={false} />
    </mesh>
  );
}

function ProductFallGlitter({ hoverRef }: { hoverRef: RefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const pool = useRef<{ x: number; y: number; z: number; vy: number; vx: number; life: number; maxLife: number }[]>([]);
  const smoothRef = useRef(0);
  const [star, setStar] = useState<THREE.Texture | null>(null);
  const positions = useMemo(() => new Float32Array(MAX_GLITTER * 3), []);

  useEffect(() => {
    let active = true;
    new THREE.TextureLoader().load("/star.png", (texture) => {
      if (!active) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      setStar(texture);
    });
    return () => {
      active = false;
    };
  }, []);

  useFrame((_, delta) => {
    smoothRef.current = THREE.MathUtils.damp(smoothRef.current, hoverRef.current ?? 0, 10, delta);
    const hover = smoothRef.current;

    if (hover > 0.04 && pool.current.length < getGlitterCap() && Math.random() < 0.45 + hover * 0.55) {
      pool.current.push({
        x: (Math.random() - 0.5) * 0.14,
        y: 0.1 + Math.random() * 0.16,
        z: 0.02 + (Math.random() - 0.5) * 0.1,
        vy: -(0.12 + Math.random() * 0.22),
        vx: (Math.random() - 0.5) * 0.05,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.9,
      });
    }

    for (let i = pool.current.length - 1; i >= 0; i--) {
      const p = pool.current[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        pool.current.splice(i, 1);
        continue;
      }
      p.y += p.vy * delta;
      p.x += p.vx * delta;
      p.vy -= delta * 0.42;
      p.vx *= 1 - delta * 0.35;
    }

    const mesh = pointsRef.current;
    if (!mesh) return;
    mesh.visible = (hover > 0.02 || pool.current.length > 0) && !!star;
    const posAttr = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < MAX_GLITTER; i++) {
      const p = pool.current[i];
      posAttr.setXYZ(
        i,
        p && p.life < p.maxLife ? p.x : 0,
        p && p.life < p.maxLife ? p.y : -99,
        p && p.life < p.maxLife ? p.z : 0,
      );
    }
    posAttr.needsUpdate = true;
    const mat = mesh.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.lerp(0.7, 1, hover);
  });

  if (!star) return null;

  return (
    <points ref={pointsRef} visible={false} renderOrder={8} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={star}
        size={0.075}
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#F4E4B8"
        toneMapped={false}
      />
    </points>
  );
}

function ProductModel({
  slotIndex,
  url,
  anchor,
  tableRootRef,
}: {
  slotIndex: number;
  url: string;
  anchor: TableSurfaceAnchor;
  tableRootRef: RefObject<THREE.Group | null>;
}) {
  const { scene } = useGLTF(url);
  const rootRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const fitRef = useRef(1);
  const bottomRef = useRef(0);
  const centerRef = useRef(new THREE.Vector3());
  const baseScaleRef = useRef(1);
  const hoverLiftRef = useRef(0.04);
  const shadowRadiusRef = useRef(0.06);
  const hoverRef = useRef(0);
  const baseYRef = useRef(anchor.y);
  const tableLiftRef = useRef(0.01);
  const { camera, size } = useThree();
  const [hovered, setHovered] = useState(false);
  const product = getProductBySlot(slotIndex);

  useLayoutEffect(() => {
    hideEmbeddedProductBackdrops(scene);
    removeProductBackgroundTextures(scene);
    polishJewelryMaterials(scene);

    const box = getVisibleBox(scene);
    const jewelryBox = getJewelryPlacementBox(scene);
    const modelSize = jewelryBox.getSize(new THREE.Vector3());
    jewelryBox.getCenter(centerRef.current);
    bottomRef.current = box.min.y;
    fitRef.current = Math.max(modelSize.y, 0.001);

    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.renderOrder = 25;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
          mat.polygonOffset = true;
          mat.polygonOffsetFactor = -2;
          mat.polygonOffsetUnits = -2;
        }
      });
    });
  }, [scene]);

  useLayoutEffect(() => {
    if (!pivotRef.current || !(camera instanceof THREE.PerspectiveCamera) || !tableRootRef.current) return;

    baseYRef.current = anchor.y;

    const worldPos = new THREE.Vector3(anchor.x, anchor.y, anchor.z + PRODUCT_TABLE_Z);
    tableRootRef.current.localToWorld(worldPos);

    tableLiftRef.current = getWorldSizeForScreenPx(
      camera,
      worldPos,
      size.height,
      PRODUCT_TABLE_LIFT_PX,
    );

    const liftedPos = new THREE.Vector3(
      anchor.x,
      anchor.y + tableLiftRef.current,
      anchor.z + PRODUCT_TABLE_Z,
    );
    tableRootRef.current.localToWorld(liftedPos);

    const targetPx = getProductScreenPx();
    baseScaleRef.current = getWorldScaleForScreenPx(camera, liftedPos, fitRef.current, size.height, targetPx);
    hoverLiftRef.current = getWorldSizeForScreenPx(camera, liftedPos, size.height, PRODUCT_HOVER_LIFT_PX);
    shadowRadiusRef.current = getWorldSizeForScreenPx(camera, liftedPos, size.height, 34);

    pivotRef.current.position.set(-centerRef.current.x, -bottomRef.current, -centerRef.current.z);
    pivotRef.current.scale.setScalar(baseScaleRef.current);
  }, [anchor, camera, scene, size.height, size.width, tableRootRef]);

  useFrame((state, delta) => {
    hoverRef.current = THREE.MathUtils.damp(hoverRef.current, hovered ? 1 : 0, 9, delta);
    const t = hoverRef.current;

    if (rootRef.current) {
      rootRef.current.position.set(
        anchor.x,
        baseYRef.current + tableLiftRef.current + hoverLiftRef.current * t,
        anchor.z + PRODUCT_TABLE_Z,
      );
      rootRef.current.rotation.y = t * 0.1;
      rootRef.current.rotation.z = 0;
    }
    if (pivotRef.current) {
      const scale = baseScaleRef.current * (1 + (PRODUCT_HOVER_SCALE - 1) * t);
      pivotRef.current.scale.setScalar(scale);
    }
  });

  const setHover = (active: boolean) => {
    setHovered(active);
    document.body.style.cursor = active ? "pointer" : "auto";
  };

  const pointerProps = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (product) window.location.assign(`/shop/${product.slug}`);
    },
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHover(true);
    },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHover(false);
    },
  };

  return (
    <group
      ref={rootRef}
      position={[anchor.x, anchor.y + tableLiftRef.current, anchor.z + PRODUCT_TABLE_Z]}
    >
      <ProductContactShadow radius={shadowRadiusRef.current} hoverRef={hoverRef} />
      <ProductFallGlitter hoverRef={hoverRef} />
      <group ref={pivotRef} renderOrder={20} {...pointerProps}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export default function TableProducts({
  anchors,
  tableRootRef,
}: {
  anchors: TableSurfaceAnchor[];
  tableRootRef: RefObject<THREE.Group | null>;
}) {
  return (
    <group name="table-products">
      {products.map((product) => {
        const anchor = anchors[product.tableSlot];
        if (!anchor) return null;

        return (
          <Suspense
            key={product.id}
            fallback={<ProductAnchorPulse anchor={anchor} lift={0.01} />}
          >
            <ProductModel
              slotIndex={product.tableSlot}
              url={product.glbPath}
              anchor={anchor}
              tableRootRef={tableRootRef}
            />
          </Suspense>
        );
      })}
    </group>
  );
}
