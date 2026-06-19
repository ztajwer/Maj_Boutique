"use client";

export default function DoorBackground() {
  const doorFrameOpacity = 1;
  const vignetteOpacity = 0.22;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[2] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/door_bg.png)",
          opacity: doorFrameOpacity,
          transition: "opacity 0.4s ease-out",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-[3]"
        style={{
          opacity: vignetteOpacity,
          background:
            "radial-gradient(ellipse 80% 74% at 50% 48%, transparent 44%, rgba(110,82,62,0.16) 100%)",
        }}
        aria-hidden
      />
    </>
  );
}
