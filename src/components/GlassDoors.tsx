"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GlassDoorsProps {
  progressRef: MutableRefObject<number>;
  animRef?: MutableRefObject<{ phase: string }>;
}

/** Aligned to the door opening in door_bg.png */
export const PANEL_W = 1.2;
export const PANEL_H = 2.82;
export const DOOR_ASSEMBLY_H = PANEL_H + 0.18;
const PANEL_D = 0.038;
const MAX_OPEN = Math.PI * 0.44;
const GAP = 0.012;

const CHAMPAGNE = "#D4B48A";
const CHAMPAGNE_LIGHT = "#E8D4B0";
const MULLION = "#C9A87A";

const INSET_X = 0.086;
const INSET_Y = 0.102;
const FACE_W = PANEL_W - INSET_X * 2;
const FACE_H = PANEL_H - INSET_Y * 2;

function SatinGoldMat({ color = CHAMPAGNE }: { color?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.88}
      roughness={0.36}
      envMapIntensity={0.52}
      clearcoat={0.42}
      clearcoatRoughness={0.14}
      reflectivity={0.62}
      depthWrite
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
    <mesh position={position} renderOrder={2}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color={MULLION}
        metalness={0.9}
        roughness={0.28}
        envMapIntensity={0.48}
        clearcoat={0.35}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

function TBarHandle({ side }: { side: "left" | "right" }) {
  const meetX = side === "left" ? PANEL_W / 2 - 0.05 : -PANEL_W / 2 + 0.05;
  const barShift = side === "left" ? 0.04 : -0.04;
  const z = PANEL_D / 2 + 0.01;

  return (
    <group position={[meetX, -0.01, z]} renderOrder={3}>
      <mesh position={[barShift, 0, 0]}>
        <boxGeometry args={[0.1, 0.012, 0.012]} />
        <SatinGoldMat color={CHAMPAGNE_LIGHT} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.011, 0.05, 0.011]} />
        <SatinGoldMat color={CHAMPAGNE_LIGHT} />
      </mesh>
    </group>
  );
}

function DoorGrid({ z }: { z: number }) {
  const hPositions = [FACE_H * 0.28, -FACE_H * 0.28];

  return (
    <group>
      <MullionBar position={[0, 0, z]} size={[0.005, FACE_H, 0.007]} />
      {hPositions.map((y) => (
        <MullionBar key={y} position={[0, y, z]} size={[FACE_W, 0.005, 0.007]} />
      ))}
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
  const faceZ = PANEL_D / 2 + 0.002;

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
          <mesh renderOrder={1}>
            <boxGeometry args={[PANEL_W, PANEL_H, PANEL_D]} />
            <SatinGoldMat />
          </mesh>

          <mesh position={[0, 0, faceZ]}>
            <boxGeometry args={[FACE_W, FACE_H, 0.003]} />
            <SatinGoldMat color={CHAMPAGNE_LIGHT} />
          </mesh>

          <DoorGrid z={faceZ + 0.005} />
          <TBarHandle side={side} />
        </group>
      </group>
    </group>
  );
}

/** Only the two swinging door leaves — door_bg.png provides walls, frame, and decor. */
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
    <group position={[0, -0.01, 0]}>
      <DoorPanel side="left" targetAngleRef={leftTargetRef} animRef={animRef} />
      <DoorPanel side="right" targetAngleRef={rightTargetRef} animRef={animRef} />
    </group>
  );
}
