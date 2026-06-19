"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LOADER_DURATION_MS, LOADER_FADE_MS } from "@/lib/timing";
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
      className={`loader-screen loader-screen--bright fixed inset-0 z-50 h-screen transition-opacity duration-700 ease-out ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Loading MAJ Boutique, ${progress} percent`}
    >
      <LoaderFallingGlitter progress={progress} />
      <LoaderStars />

      <div className="pointer-events-none absolute inset-8 border border-maj-gold/22 sm:inset-12 md:inset-14" />

      <div className="loader-shell relative z-10 flex h-full min-h-screen flex-col items-start justify-center">
        <div className="loader-stack animate-fade-up">
          <div className="loader-logo-wrap">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-maj-gold/15 blur-3xl sm:-inset-10" />
              <div className="loader-logo-size loader-logo-medallion relative flex items-center justify-center overflow-hidden rounded-full border-2 border-maj-gold/45 shadow-[0_0_56px_rgba(200,160,90,0.28)] ring-2 ring-white/60">
                <img
                  src="/wh_logo.jpeg"
                  alt="MAJ Boutique"
                  className="loader-logo-white h-[78%] w-[78%] object-contain object-center"
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          <div className="loader-progress w-full max-w-[min(92vw,28rem)] sm:max-w-[min(88vw,32rem)] md:max-w-md">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-sans text-[10px] uppercase tracking-[0.36em] text-maj-brown/50">
                Preparing
              </span>
              <span className="font-sans text-[10px] tabular-nums tracking-wider text-maj-gold">
                {progress}%
              </span>
            </div>

            <div className="relative h-1 w-full overflow-visible rounded-full bg-maj-gold/14">
              <div
                className="loader-bar-fill relative h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
