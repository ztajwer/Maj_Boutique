"use client";

interface DoorSceneLightingProps {
  brightness?: number;
}

/** Warm rose-gold boutique lighting for realistic glass door reflections. */
export default function DoorSceneLighting({ brightness = 0 }: DoorSceneLightingProps) {
  const b = brightness;

  return (
    <>
      <ambientLight intensity={0.58 + b * 0.45} color="#FFF8F5" />
      <hemisphereLight args={["#FFF0EB", "#E8D4CC", 0.48 + b * 0.32]} />
      <directionalLight position={[0.5, 8, 6]} intensity={1.2 + b * 0.65} color="#FFFBF8" />
      <directionalLight position={[-4, 3, 5]} intensity={0.48 + b * 0.28} color="#F5D8CC" />
      <directionalLight position={[4, 3, 5]} intensity={0.48 + b * 0.28} color="#F5D8CC" />
      <pointLight position={[0, 1.6, 2.4]} intensity={0.9 + b * 0.38} color="#F8D8C8" distance={11} decay={2} />
      <pointLight position={[0, 0.2, 1.6]} intensity={0.42 + b * 0.22} color="#FFFFFF" distance={7} decay={2} />
      <spotLight
        position={[0, 2.2, 3.5]}
        angle={0.42}
        penumbra={0.85}
        intensity={0.55 + b * 0.3}
        color="#FFE8DC"
        distance={12}
      />
    </>
  );
}
