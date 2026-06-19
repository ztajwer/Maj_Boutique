"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bootCriticalAssets } from "@/lib/preloadAssets";
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
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);
    setFadeOut(true);
    window.setTimeout(() => {
      setVisible(false);
      onCompleteRef.current();
    }, LOADER_FADE_MS);
  }, []);

  useEffect(() => {
    bootCriticalAssets();

    const start = performance.now();
    const progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / LOADER_DURATION_MS);
      const eased = t * t * (3 - 2 * t);
      setProgress(Math.round(eased * 100));
    }, 32);

    const doneTimer = window.setTimeout(finish, LOADER_DURATION_MS);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(doneTimer);
    };
  }, [finish]);

  if (!visible) return null;

  return (
    <div
      className={`loader-screen loader-screen--fast fixed inset-0 z-50 h-screen transition-opacity duration-700 ease-out ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.32) 45%, rgba(0,0,0,0.62) 100%)",
        }}
      />

      <LoaderFallingGlitter progress={progress} />
      <LoaderStars />

      <div className="pointer-events-none absolute inset-8 border border-maj-gold/15 sm:inset-12 md:inset-14" />

      <div className="loader-shell relative z-10 flex h-full min-h-screen flex-col items-start justify-center">
        <div className="loader-stack animate-fade-up">
          <div className="loader-logo-wrap">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-maj-gold/20 blur-3xl sm:-inset-10" />
              <div className="loader-logo-size relative overflow-hidden rounded-full border-2 border-maj-gold/50 bg-black shadow-[0_0_64px_rgba(212,175,55,0.45)] ring-2 ring-maj-gold/30">
                <img
                  src="/logo.png"
                  alt="MAJ Boutique"
                  className="h-full w-full object-cover object-center"
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
              <span className="font-sans text-[10px] uppercase tracking-[0.36em] text-white/50">
                Preparing
              </span>
              <span className="font-sans text-[10px] tabular-nums tracking-wider text-maj-gold-light">
                {progress}%
              </span>
            </div>

            <div className="relative h-1 w-full overflow-visible rounded-full bg-white/10">
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
