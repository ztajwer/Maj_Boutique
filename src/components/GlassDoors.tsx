"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GlassDoorsProps {
  progressRef: MutableRefObject<number>;
  animRef?: MutableRefObject<{ phase: string }>;
}

export const PANEL_W = 1.2;
export const PANEL_H = 2.72;
export const DOOR_ASSEMBLY_H = PANEL_H + 0.2;
const PANEL_D = 0.06;
const MAX_OPEN = Math.PI * 0.44;
const HANDLE_Y = -0.04;
const HANDLE_X = PANEL_W * 0.38;

const GOLD = "#E8C04A";
const GOLD_LIGHT = "#FFF0A8";
const GOLD_DEEP = "#C9A030";
const GOLD_RICH = "#DDB842";

function ShinyGoldMat({
  roughness = 0.05,
  color = GOLD,
  envIntensity = 2.4,
}: {
  roughness?: number;
  color?: string;
  envIntensity?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={1}
      roughness={roughness}
      envMapIntensity={envIntensity}
      clearcoat={1}
      clearcoatRoughness={0.02}
      reflectivity={1}
      sheen={0.35}
      sheenRoughness={0.18}
      sheenColor={GOLD_LIGHT}
    />
  );
}

function DoorHandle({ side }: { side: "left" | "right" }) {
  const x = side === "left" ? HANDLE_X : -HANDLE_X;

  return (
    <group position={[x, HANDLE_Y, PANEL_D / 2 + 0.04]}>
      <mesh position={[0, 0, -0.012]} castShadow>
        <boxGeometry args={[0.06, 0.26, 0.016]} />
        <ShinyGoldMat roughness={0.08} color={GOLD_DEEP} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.06]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 24]} />
        <ShinyGoldMat roughness={0.04} color={GOLD_LIGHT} />
      </mesh>
      {[-0.085, 0.085].map((offset) => (
        <mesh key={offset} position={[0, offset, 0.028]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.055, 14]} />
          <ShinyGoldMat roughness={0.06} />
        </mesh>
      ))}
      <mesh position={[0, -0.12, 0.02]} castShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.028, 16]} />
        <ShinyGoldMat roughness={0.07} color={GOLD_RICH} />
      </mesh>
    </group>
  );
}

function DoorPanel({
  side,
  targetAngleRef,
  animRef,
}: {
  side: "left" | "right";
  targetAngleRef: MutableRefObject<number>;
  animRef?: MutableRefObject<{ phase: string }>;
}) {
  const pivotRef = useRef<THREE.Group>(null);
  const angle = useRef(0);

  const hingeX = side === "left" ? -PANEL_W : PANEL_W;
  const panelCenterX = side === "left" ? PANEL_W / 2 : -PANEL_W / 2;
  const openDir = side === "left" ? -1 : 1;
  const hingeEdgeX = side === "left" ? -PANEL_W / 2 : PANEL_W / 2;

  useFrame((_, delta) => {
    if (!pivotRef.current) return;
    const target = targetAngleRef.current * openDir;
    const phase = animRef?.current.phase;
    if (phase === "complete") {
      angle.current = target;
    } else {
      const follow = phase === "opening" ? 20 : 10;
      angle.current = THREE.MathUtils.lerp(angle.current, target, Math.min(1, delta * follow));
    }
    pivotRef.current.rotation.y = angle.current;
  });

  return (
    <group position={[hingeX, 0, 0]}>
      <group ref={pivotRef}>
        <group position={[panelCenterX, 0, 0]}>
          {/* Solid gold door slab */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[PANEL_W, PANEL_H, PANEL_D]} />
            <ShinyGoldMat />
          </mesh>

          {/* Subtle beveled edge highlight — no grid bars */}
          <mesh position={[0, 0, PANEL_D / 2 + 0.002]}>
            <boxGeometry args={[PANEL_W - 0.04, PANEL_H - 0.04, 0.008]} />
            <ShinyGoldMat roughness={0.03} color={GOLD_LIGHT} envIntensity={2.8} />
          </mesh>

          {/* Soft inner glow panel */}
          <mesh position={[0, 0, PANEL_D / 2 + 0.006]}>
            <boxGeometry args={[PANEL_W - 0.12, PANEL_H - 0.12, 0.004]} />
            <ShinyGoldMat roughness={0.02} color={GOLD_LIGHT} envIntensity={3} />
          </mesh>

          <DoorHandle side={side} />

          {/* Hinge hardware */}
          {[PANEL_H * 0.38, 0, -PANEL_H * 0.38].map((y) => (
            <group key={y} position={[hingeEdgeX, y, -0.008]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.016, 0.016, 0.07, 16]} />
                <ShinyGoldMat roughness={0.1} color={GOLD_DEEP} />
              </mesh>
              <mesh position={[side === "left" ? 0.035 : -0.035, 0, 0]} castShadow>
                <boxGeometry args={[0.05, 0.034, 0.034]} />
                <ShinyGoldMat roughness={0.08} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

function DoorFrame() {
  const totalW = PANEL_W * 2 + 0.08;

  return (
    <group>
      <mesh position={[0, PANEL_H / 2 + 0.1, 0.004]} castShadow>
        <boxGeometry args={[totalW + 0.12, 0.06, 0.04]} />
        <ShinyGoldMat roughness={0.06} color={GOLD_LIGHT} />
      </mesh>
      <mesh position={[0, -PANEL_H / 2 - 0.008, 0.06]} castShadow>
        <boxGeometry args={[totalW + 0.1, 0.012, 0.03]} />
        <ShinyGoldMat roughness={0.06} />
      </mesh>
      <mesh position={[-PANEL_W - 0.02, 0, 0.008]} castShadow>
        <boxGeometry args={[0.02, PANEL_H + 0.06, 0.05]} />
        <ShinyGoldMat roughness={0.07} color={GOLD_RICH} />
      </mesh>
      <mesh position={[PANEL_W + 0.02, 0, 0.008]} castShadow>
        <boxGeometry args={[0.02, PANEL_H + 0.06, 0.05]} />
        <ShinyGoldMat roughness={0.07} color={GOLD_RICH} />
      </mesh>
    </group>
  );
}

export default function GlassDoors({ progressRef, animRef }: GlassDoorsProps) {
  const leftTargetRef = useRef(0);
  const rightTargetRef = useRef(0);
  const shadowMatRef = useRef<THREE.ShadowMaterial>(null);

  useFrame(() => {
    const p = progressRef.current;
    leftTargetRef.current = p * MAX_OPEN;
    const delayed = Math.max(0, (p - 0.06) / 0.94);
    rightTargetRef.current = delayed * MAX_OPEN;

    if (shadowMatRef.current) {
      shadowMatRef.current.opacity = 0.12 + p * 0.14;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <DoorFrame />
      <DoorPanel side="left" targetAngleRef={leftTargetRef} animRef={animRef} />
      <DoorPanel side="right" targetAngleRef={rightTargetRef} animRef={animRef} />
      <mesh position={[0, -PANEL_H / 2 - 0.026, 0.22]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <shadowMaterial ref={shadowMatRef} transparent opacity={0.12} color="#6B5238" />
      </mesh>
    </group>
  );
}
