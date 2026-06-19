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
const PANEL_D = 0.052;
const MAX_OPEN = Math.PI * 0.44;
const HANDLE_Y = -0.04;
const HANDLE_X = PANEL_W * 0.36;

const INSET_X = 0.1;
const INSET_Y = 0.12;
const GLASS_W = PANEL_W - INSET_X * 2;
const GLASS_H = PANEL_H - INSET_Y * 2;

const ROSE_GOLD = "#C9957A";
const ROSE_GOLD_LIGHT = "#E8C4B0";
const ROSE_GOLD_DEEP = "#A87462";
const ROSE_GOLD_BRIGHT = "#F2D4C4";
const ROSE_PEARL = "#EDD5CA";
const ROSE_GLASS_TINT = "#FFF6F2";

function RoseGoldMetal({
  roughness = 0.16,
  color = ROSE_GOLD,
  envIntensity = 2.1,
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
      clearcoat={0.92}
      clearcoatRoughness={0.04}
      reflectivity={1}
      sheen={0.22}
      sheenRoughness={0.25}
      sheenColor={ROSE_GOLD_LIGHT}
    />
  );
}

function RoseGlass() {
  return (
    <meshPhysicalMaterial
      color={ROSE_GLASS_TINT}
      metalness={0.02}
      roughness={0.015}
      transmission={1}
      thickness={0.65}
      ior={1.52}
      envMapIntensity={1.85}
      transparent
      opacity={1}
      side={THREE.DoubleSide}
      reflectivity={0.95}
      attenuationColor="#E8A898"
      attenuationDistance={0.42}
      clearcoat={0.35}
      clearcoatRoughness={0.03}
    />
  );
}

function RosePearlBacking() {
  return (
    <meshPhysicalMaterial
      color={ROSE_PEARL}
      metalness={0.28}
      roughness={0.38}
      envMapIntensity={0.95}
      clearcoat={0.55}
      clearcoatRoughness={0.12}
      reflectivity={0.65}
      sheen={0.4}
      sheenRoughness={0.35}
      sheenColor={ROSE_GOLD_BRIGHT}
    />
  );
}

function DoorHandle({ side }: { side: "left" | "right" }) {
  const x = side === "left" ? HANDLE_X : -HANDLE_X;

  return (
    <group position={[x, HANDLE_Y, PANEL_D / 2 + 0.045]}>
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[0.055, 0.24, 0.014]} />
        <RoseGoldMetal roughness={0.12} color={ROSE_GOLD_DEEP} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.055]}>
        <cylinderGeometry args={[0.011, 0.011, 0.19, 28]} />
        <RoseGoldMetal roughness={0.08} color={ROSE_GOLD_BRIGHT} />
      </mesh>
      {[-0.08, 0.08].map((offset) => (
        <mesh key={offset} position={[0, offset, 0.024]}>
          <cylinderGeometry args={[0.0075, 0.0075, 0.05, 16]} />
          <RoseGoldMetal roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.038]}>
        <sphereGeometry args={[0.016, 20, 20]} />
        <meshPhysicalMaterial
          color="#FFF8F5"
          metalness={0}
          roughness={0.02}
          transmission={0.88}
          thickness={0.2}
          ior={1.55}
          envMapIntensity={1.4}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </mesh>
    </group>
  );
}

function FrameMolding({
  position,
  size,
  roughness = 0.14,
  color = ROSE_GOLD,
}: {
  position: [number, number, number];
  size: [number, number, number];
  roughness?: number;
  color?: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <RoseGoldMetal roughness={roughness} color={color} />
    </mesh>
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

  const zFace = PANEL_D / 2;

  return (
    <group position={[hingeX, 0, 0]}>
      <group ref={pivotRef}>
        <group position={[panelCenterX, 0, 0]}>
          {/* Outer door body */}
          <mesh>
            <boxGeometry args={[PANEL_W, PANEL_H, PANEL_D]} />
            <RoseGoldMetal roughness={0.2} color={ROSE_GOLD_DEEP} />
          </mesh>

          {/* Stepped frame profile */}
          <FrameMolding
            position={[0, PANEL_H / 2 - 0.045, zFace + 0.004]}
            size={[PANEL_W - 0.04, 0.09, 0.012]}
            color={ROSE_GOLD_LIGHT}
            roughness={0.1}
          />
          <FrameMolding
            position={[0, -PANEL_H / 2 + 0.05, zFace + 0.004]}
            size={[PANEL_W - 0.04, 0.07, 0.014]}
            roughness={0.09}
          />
          <FrameMolding
            position={[-PANEL_W / 2 + 0.05, 0, zFace + 0.004]}
            size={[0.08, PANEL_H - 0.14, 0.012]}
            color={ROSE_GOLD_LIGHT}
            roughness={0.11}
          />
          <FrameMolding
            position={[PANEL_W / 2 - 0.05, 0, zFace + 0.004]}
            size={[0.08, PANEL_H - 0.14, 0.012]}
            color={ROSE_GOLD_LIGHT}
            roughness={0.11}
          />

          {/* Inner frame lip */}
          <FrameMolding
            position={[0, 0, zFace + 0.001]}
            size={[PANEL_W - 0.06, PANEL_H - 0.08, 0.006]}
            roughness={0.13}
            color={ROSE_GOLD}
          />

          {/* Opaque pearl backing — blocks interior see-through & shadow bleed */}
          <mesh position={[0, 0, -zFace + 0.018]} renderOrder={1}>
            <boxGeometry args={[GLASS_W, GLASS_H, 0.012]} />
            <RosePearlBacking />
          </mesh>

          {/* Crystal rose-tinted glass */}
          <mesh position={[0, 0, zFace - 0.008]} renderOrder={2}>
            <boxGeometry args={[GLASS_W, GLASS_H, 0.018]} />
            <RoseGlass />
          </mesh>

          {/* Delicate rose-gold accent rails (not dark grid) */}
          <FrameMolding
            position={[0, GLASS_H * 0.22, zFace + 0.01]}
            size={[GLASS_W - 0.08, 0.008, 0.006]}
            color={ROSE_GOLD_BRIGHT}
            roughness={0.07}
          />
          <FrameMolding
            position={[0, -GLASS_H * 0.22, zFace + 0.01]}
            size={[GLASS_W - 0.08, 0.008, 0.006]}
            color={ROSE_GOLD_BRIGHT}
            roughness={0.07}
          />

          {/* Corner rosette accents */}
          {(
            [
              [-GLASS_W / 2 + 0.06, GLASS_H / 2 - 0.06],
              [GLASS_W / 2 - 0.06, GLASS_H / 2 - 0.06],
              [-GLASS_W / 2 + 0.06, -GLASS_H / 2 + 0.06],
              [GLASS_W / 2 - 0.06, -GLASS_H / 2 + 0.06],
            ] as const
          ).map(([x, y]) => (
            <mesh key={`${x}-${y}`} position={[x, y, zFace + 0.011]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.028, 0.028, 0.005]} />
              <RoseGoldMetal roughness={0.08} color={ROSE_GOLD_BRIGHT} envIntensity={2.4} />
            </mesh>
          ))}

          <DoorHandle side={side} />

          {/* Hinges */}
          {[PANEL_H * 0.38, 0, -PANEL_H * 0.38].map((y) => (
            <group key={y} position={[hingeEdgeX, y, -0.006]}>
              <mesh>
                <cylinderGeometry args={[0.015, 0.015, 0.065, 18]} />
                <RoseGoldMetal roughness={0.14} color={ROSE_GOLD_DEEP} />
              </mesh>
              <mesh position={[side === "left" ? 0.032 : -0.032, 0, 0]}>
                <boxGeometry args={[0.048, 0.032, 0.032]} />
                <RoseGoldMetal roughness={0.12} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

function DoorFrame() {
  const totalW = PANEL_W * 2 + 0.1;

  return (
    <group>
      <FrameMolding
        position={[0, PANEL_H / 2 + 0.11, 0.005]}
        size={[totalW + 0.14, 0.065, 0.038]}
        color={ROSE_GOLD_LIGHT}
        roughness={0.1}
      />
      <FrameMolding
        position={[0, PANEL_H / 2 + 0.075, 0.008]}
        size={[totalW + 0.08, 0.028, 0.028]}
        roughness={0.12}
      />
      <FrameMolding
        position={[0, -PANEL_H / 2 - 0.01, 0.055]}
        size={[totalW + 0.12, 0.014, 0.028]}
        roughness={0.1}
      />
      <FrameMolding
        position={[-PANEL_W - 0.022, 0, 0.006]}
        size={[0.022, PANEL_H + 0.08, 0.048]}
        color={ROSE_GOLD_DEEP}
        roughness={0.15}
      />
      <FrameMolding
        position={[PANEL_W + 0.022, 0, 0.006]}
        size={[0.022, PANEL_H + 0.08, 0.048]}
        color={ROSE_GOLD_DEEP}
        roughness={0.15}
      />
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
    <group position={[0, 0, 0]}>
      <DoorFrame />
      <DoorPanel side="left" targetAngleRef={leftTargetRef} animRef={animRef} />
      <DoorPanel side="right" targetAngleRef={rightTargetRef} animRef={animRef} />
    </group>
  );
}
