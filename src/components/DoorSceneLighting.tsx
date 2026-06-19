"use client";

interface DoorSceneLightingProps {
  brightness?: number;
}

/** Door scene lights only — no drei environment imports (avoids chunk load errors). */
export default function DoorSceneLighting({ brightness = 0 }: DoorSceneLightingProps) {
  const b = brightness;

  return (
    <>
      <ambientLight intensity={0.48 + b * 0.45} color="#FFF9F5" />
      <hemisphereLight args={["#FFFFFF", "#E8DDD4", 0.34 + b * 0.28]} />
      <directionalLight position={[0, 7, 5]} intensity={0.9 + b * 0.65} color="#FFF8F2" />
      <directionalLight position={[-3, 2, 4]} intensity={0.32 + b * 0.24} color="#FFD878" />
      <directionalLight position={[3, 2, 4]} intensity={0.32 + b * 0.24} color="#FFD878" />
      <pointLight position={[0, 1.2, 1.8]} intensity={0.55 + b * 0.35} color="#E8C872" distance={8} />
    </>
  );
}
