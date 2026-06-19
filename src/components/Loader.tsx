"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LOADER_DURATION_MS, LOADER_FADE_MS } from "@/lib/timing";
import LoaderBrandMark from "./LoaderBrandMark";
import LoaderFallingGlitter from "./LoaderFallingGlitter";
import LoaderStars from "./LoaderStars";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const complete = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setProgress(100);
    setFadeOut(true);
    window.setTimeout(() => {
      setVisible(false);
      onCompleteRef.current();
    }, LOADER_FADE_MS);
  }, []);

  useEffect(() => {
    const started = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const t = Math.min(1, elapsed / LOADER_DURATION_MS);
      const eased = t * t * (3 - 2 * t);
      setProgress(Math.round(eased * 100));
      if (elapsed >= LOADER_DURATION_MS) {
        window.clearInterval(tick);
        complete();
      }
    }, 40);

    return () => window.clearInterval(tick);
  }, [complete]);

  if (!visible) return null;

  return (
    <div
      className={`loader-screen loader-screen--bright fixed inset-0 z-50 flex h-[100dvh] min-h-[100svh] items-center justify-center transition-opacity duration-500 ease-out ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Loading MAJ Boutique, ${progress} percent`}
    >
      <LoaderFallingGlitter progress={progress} />
      <LoaderStars />

      <div className="pointer-events-none absolute inset-6 border border-maj-gold/18 sm:inset-10 md:inset-14" />

      <div className="loader-panel relative z-10 flex w-full max-w-md flex-col items-center px-6">
        <div className="loader-logo-wrap w-full">
          <div className="relative mx-auto w-fit">
            <div className="loader-logo-glow pointer-events-none absolute inset-0 rounded-full" aria-hidden />
            <div className="loader-logo-disc loader-logo-size relative flex items-center justify-center">
              <LoaderBrandMark />
            </div>
          </div>
        </div>

        <div className="loader-progress mt-8 w-full max-w-[16rem] sm:max-w-xs">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-sans text-[10px] uppercase tracking-[0.38em] text-maj-brown/50">
              Preparing
            </span>
            <span className="font-sans text-[10px] tabular-nums tracking-wider text-maj-gold">
              {progress}%
            </span>
          </div>
          <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-maj-gold/12">
            <div
              className="loader-bar-fill h-full rounded-full transition-[width] duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
