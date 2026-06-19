"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DOOR_VIEW } from "@/lib/doorAlignment";

interface GlassDoorsProps {
  progressRef: MutableRefObject<number>;
  animRef?: MutableRefObject<{ phase: string }>;
}

export const PANEL_W = DOOR_VIEW.panelW;
export const PANEL_H = DOOR_VIEW.panelH;
export { DOOR_ASSEMBLY_H } from "@/lib/doorAlignment";

const PANEL_D = 0.036;
const MAX_OPEN = Math.PI * 0.44;
const GAP = DOOR_VIEW.gap;

const CHAMPAGNE = "#C9A06A";
const CHAMPAGNE_BRIGHT = "#EDD9B0";
const MULLION = "#D4B87A";
const FRAME_DARK = "#2C2620";

const FRAME_X = 0.092;
const FRAME_Y = 0.108;
const GLASS_W = PANEL_W - FRAME_X * 2;
const GLASS_H = PANEL_H - FRAME_Y * 2;

function GoldMat({
  color = CHAMPAGNE,
  roughness = 0.26,
  envIntensity = 0.58,
}: {
  color?: string;
  roughness?: number;
  envIntensity?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.92}
      roughness={roughness}
      envMapIntensity={envIntensity}
      clearcoat={0.38}
      clearcoatRoughness={0.1}
      reflectivity={0.68}
    />
  );
}

function MullionBar({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} renderOrder={3}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color={MULLION}
        metalness={0.94}
        roughness={0.22}
        envMapIntensity={0.55}
        clearcoat={0.4}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

/** Vertical pull bar at the meeting stile — matches door_bg.png */
function VerticalHandle({ side }: { side: "left" | "right" }) {
  const meetX = side === "left" ? PANEL_W / 2 - 0.042 : -PANEL_W / 2 + 0.042;
  const z = PANEL_D / 2 + 0.012;

  return (
    <group position={[meetX, 0.02, z]} renderOrder={4}>
      <mesh>
        <boxGeometry args={[0.014, 0.42, 0.016]} />
        <GoldMat color={CHAMPAGNE_BRIGHT} roughness={0.18} />
      </mesh>
    </group>
  );
}

/** Three horizontals dividing glass into four rows */
function HorizontalGrid({ z }: { z: number }) {
  const rowYs = [GLASS_H * 0.22, 0, -GLASS_H * 0.22];

  return (
    <>
      {rowYs.map((y) => (
        <MullionBar key={`h-${y}`} position={[0, y, z]} size={[GLASS_W, 0.0045, 0.006]} />
      ))}
    </>
  );
}

function DoorLeafGrid({ z, side }: { z: number; side: "left" | "right" }) {
  const vertX = side === "left" ? GLASS_W * 0.22 : -GLASS_W * 0.22;

  return (
    <group>
      <HorizontalGrid z={z} />
      <MullionBar position={[vertX, 0, z]} size={[0.0045, GLASS_H, 0.006]} />
    </group>
  );
}

function FrostedGlass() {
  return (
    <meshPhysicalMaterial
      color="#EDE0CC"
      metalness={0.04}
      roughness={0.44}
      transmission={0.08}
      thickness={0.016}
      transparent
      opacity={0.96}
      envMapIntensity={0.35}
      clearcoat={0.18}
      clearcoatRoughness={0.22}
      attenuationColor="#E8D4B8"
      attenuationDistance={4}
      depthWrite
    />
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

  const hingeX = side === "left" ? -(PANEL_W + GAP / 2) : PANEL_W + GAP / 2;
  const panelCenterX = side === "left" ? PANEL_W / 2 : -PANEL_W / 2;
  const openDir = side === "left" ? -1 : 1;
  const faceZ = PANEL_D / 2 + 0.004;
  const halfW = PANEL_W / 2;
  const halfH = PANEL_H / 2;

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
        <group position={[panelCenterX, 0, 0]} renderOrder={1}>
          {/* Dark inner frame recess */}
          <mesh position={[0, 0, -0.002]} renderOrder={0}>
            <boxGeometry args={[PANEL_W + 0.008, PANEL_H + 0.008, PANEL_D + 0.006]} />
            <meshPhysicalMaterial color={FRAME_DARK} metalness={0.35} roughness={0.55} envMapIntensity={0.12} />
          </mesh>

          {/* Gold perimeter frame */}
          <mesh position={[0, halfH - FRAME_Y / 2, 0]}>
            <boxGeometry args={[PANEL_W, FRAME_Y, PANEL_D]} />
            <GoldMat />
          </mesh>
          <mesh position={[0, -halfH + FRAME_Y / 2, 0]}>
            <boxGeometry args={[PANEL_W, FRAME_Y, PANEL_D]} />
            <GoldMat />
          </mesh>
          <mesh position={[-halfW + FRAME_X / 2, 0, 0]}>
            <boxGeometry args={[FRAME_X, PANEL_H - FRAME_Y * 2, PANEL_D]} />
            <GoldMat />
          </mesh>
          <mesh position={[halfW - FRAME_X / 2, 0, 0]}>
            <boxGeometry args={[FRAME_X, PANEL_H - FRAME_Y * 2, PANEL_D]} />
            <GoldMat />
          </mesh>

          {/* Frosted glass inset */}
          <mesh position={[0, 0, faceZ - 0.001]} renderOrder={1}>
            <boxGeometry args={[GLASS_W, GLASS_H, 0.012]} />
            <FrostedGlass />
          </mesh>

          {/* Warm inner glow — matches backlit frosted look */}
          <mesh position={[0, 0, faceZ - 0.004]} renderOrder={0}>
            <boxGeometry args={[GLASS_W * 0.96, GLASS_H * 0.96, 0.004]} />
            <meshBasicMaterial color="#FFF4E6" transparent opacity={0.35} depthWrite={false} />
          </mesh>

          <DoorLeafGrid z={faceZ + 0.006} side={side} />
          <VerticalHandle side={side} />
        </group>
      </group>
    </group>
  );
}

export default function GlassDoors({ progressRef, animRef }: GlassDoorsProps) {
  const leftTargetRef = useRef(0);
  const rightTargetRef = useRef(0);

  useFrame(() => {
    const p = progressRef.current;
    leftTargetRef.current = p * MAX_OPEN;
    const delayed = Math.max(0, (p - 0.06) / 0.94);
    rightTargetRef.current = delayed * MAX_OPEN;
  });

  return (
    <group position={[0, DOOR_VIEW.offsetY, DOOR_VIEW.offsetZ]}>
      <DoorPanel side="left" targetAngleRef={leftTargetRef} animRef={animRef} />
      <DoorPanel side="right" targetAngleRef={rightTargetRef} animRef={animRef} />
    </group>
  );
}
