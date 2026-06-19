"use client";

interface DoorBackgroundProps {
  fadeProgress?: number;
}

export default function DoorBackground({ fadeProgress = 0 }: DoorBackgroundProps) {
  const opacity = Math.max(0, 1 - fadeProgress * 1.12);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-out"
      style={{
        backgroundImage: "url(/door_bg.png)",
        opacity,
      }}
      aria-hidden
    />
  );
}
