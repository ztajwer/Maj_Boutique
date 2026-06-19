"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DOOR_VIEW, doorOffsetY } from "@/lib/doorAlignment";

interface GlassDoorsProps {
  progressRef: MutableRefObject<number>;
  animRef?: MutableRefObject<{ phase: string }>;
}

export const PANEL_W = DOOR_VIEW.panelW;
export const PANEL_H = DOOR_VIEW.panelH;
export { DOOR_ASSEMBLY_H } from "@/lib/doorAlignment";

const PANEL_D = 0.034;
const MAX_OPEN = Math.PI * 0.44;
const GAP = DOOR_VIEW.gap;

const CHAMPAGNE_BRIGHT = "#EDD9B0";
const MULLION = "#D4B87A";

const GLASS_W = PANEL_W - 0.18;
const GLASS_H = PANEL_H - 0.21;

function MullionBar({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} renderOrder={2}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color={MULLION}
        metalness={0.94}
        roughness={0.22}
        envMapIntensity={0.5}
        clearcoat={0.4}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

function VerticalHandle({ side }: { side: "left" | "right" }) {
  const meetX = side === "left" ? PANEL_W / 2 - 0.04 : -PANEL_W / 2 + 0.04;
  const z = PANEL_D / 2 + 0.01;

  return (
    <group position={[meetX, 0.02, z]} renderOrder={3}>
      <mesh>
        <boxGeometry args={[0.013, 0.4, 0.014]} />
        <meshPhysicalMaterial
          color={CHAMPAGNE_BRIGHT}
          metalness={0.92}
          roughness={0.18}
          envMapIntensity={0.55}
          clearcoat={0.35}
        />
      </mesh>
    </group>
  );
}

function DoorLeafGrid({ z, side }: { z: number; side: "left" | "right" }) {
  const rowYs = [GLASS_H * 0.22, 0, -GLASS_H * 0.22];
  const vertX = side === "left" ? GLASS_W * 0.22 : -GLASS_W * 0.22;

  return (
    <group>
      {rowYs.map((y) => (
        <MullionBar key={y} position={[0, y, z]} size={[GLASS_W, 0.0045, 0.006]} />
      ))}
      <MullionBar position={[vertX, 0, z]} size={[0.0045, GLASS_H, 0.006]} />
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

  const hingeX = side === "left" ? -(PANEL_W + GAP / 2) : PANEL_W + GAP / 2;
  const panelCenterX = side === "left" ? PANEL_W / 2 : -PANEL_W / 2;
  const openDir = side === "left" ? -1 : 1;
  const faceZ = PANEL_D / 2 + 0.003;

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
          {/* Frosted gold glass — covers doors in door_bg.png; frame comes from the photo */}
          <mesh renderOrder={1}>
            <boxGeometry args={[PANEL_W, PANEL_H, PANEL_D]} />
            <meshPhysicalMaterial
              color="#EDE0CC"
              metalness={0.05}
              roughness={0.42}
              transmission={0.06}
              thickness={0.014}
              transparent
              opacity={0.98}
              envMapIntensity={0.32}
              clearcoat={0.2}
              clearcoatRoughness={0.2}
              attenuationColor="#E8D4B8"
              attenuationDistance={3}
            />
          </mesh>

          <mesh position={[0, 0, faceZ - 0.002]} renderOrder={0}>
            <boxGeometry args={[GLASS_W * 0.97, GLASS_H * 0.97, 0.003]} />
            <meshBasicMaterial color="#FFF4E6" transparent opacity={0.28} depthWrite={false} />
          </mesh>

          <DoorLeafGrid z={faceZ + 0.005} side={side} />
          <VerticalHandle side={side} />
        </group>
      </group>
    </group>
  );
}

/** Two swinging leaves only — door_bg.png provides walls, frame, and decor. */
export default function GlassDoors({ progressRef, animRef }: GlassDoorsProps) {
  const leftTargetRef = useRef(0);
  const rightTargetRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = progressRef.current;
    leftTargetRef.current = p * MAX_OPEN;
    const delayed = Math.max(0, (p - 0.06) / 0.94);
    rightTargetRef.current = delayed * MAX_OPEN;
    if (groupRef.current) {
      groupRef.current.position.y = doorOffsetY(state.size.width / state.size.height);
    }
  });

  return (
    <group ref={groupRef} position={[0, DOOR_VIEW.offsetY, DOOR_VIEW.offsetZ]}>
      <DoorPanel side="left" targetAngleRef={leftTargetRef} animRef={animRef} />
      <DoorPanel side="right" targetAngleRef={rightTargetRef} animRef={animRef} />
    </group>
  );
}
