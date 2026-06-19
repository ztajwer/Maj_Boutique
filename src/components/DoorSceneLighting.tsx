"use client";

interface DoorSceneLightingProps {
  brightness?: number;
}

/** Door scene lights only — no drei environment imports (avoids chunk load errors). */
export default function DoorSceneLighting({ brightness = 0 }: DoorSceneLightingProps) {
  const b = brightness;

  return (
    <>
      <ambientLight intensity={0.62 + b * 0.5} color="#FFF9F5" />
      <hemisphereLight args={["#FFF8E8", "#E8DDD4", 0.42 + b * 0.3]} />
      <directionalLight position={[0, 7, 5]} intensity={1.15 + b * 0.7} color="#FFF8F2" />
      <directionalLight position={[-3, 2.5, 4]} intensity={0.55 + b * 0.3} color="#FFE8A0" />
      <directionalLight position={[3, 2.5, 4]} intensity={0.55 + b * 0.3} color="#FFE8A0" />
      <pointLight position={[0, 1.4, 2.2]} intensity={0.85 + b * 0.4} color="#F5D878" distance={10} />
      <pointLight position={[0, 0.5, 1.2]} intensity={0.35 + b * 0.2} color="#FFFFFF" distance={6} />
    </>
  );
}
