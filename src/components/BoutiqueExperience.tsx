"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { doorEngine, scrollKickFromWheel } from "@/lib/doorEngine";
import { LoadingProvider } from "@/context/LoadingContext";
import { useDoorGestures } from "@/hooks/useDoorGestures";
import { useDoorScreenState } from "@/hooks/useDoorScreenState";
import { startBoutiqueAudioFromGesture, stopBoutiqueAudio } from "@/lib/boutiqueAudio";
import {
  bootCriticalAssets,
  prefetchShopChunk,
  startDoorTransitionPreload,
  startShopPreload,
} from "@/lib/preloadAssets";
import BoutiqueBackground from "./BoutiqueBackground";
import Loader from "./Loader";
import DoorBackground from "./DoorBackground";
import BrightnessWash from "./BrightnessWash";
import DoorScrollInvite from "./DoorScrollInvite";
import DoorChimeAudio from "./DoorChimeAudio";

const DoorSceneCanvas = dynamic(() => import("./DoorSceneCanvas"), {
  ssr: false,
  loading: () => null,
});

const ShopExperience = dynamic(() => import("./jewelry/ShopExperience"), {
  ssr: false,
  loading: () => null,
});

function BoutiqueExperienceInner() {
  const [ready, setReady] = useState(false);
  const [inviteDismissed, setInviteDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    progressRef,
    animRef,
    doorProgress,
    entered,
    phase,
    brightness,
    canvasOpacity,
    engage,
  } = useDoorScreenState(ready);

  const handleLoadComplete = useCallback(() => {
    bootCriticalAssets();
    doorEngine.setReady(true);
    setReady(true);
  }, []);

  const onDoorEngaged = useCallback((kick: number) => {
    startBoutiqueAudioFromGesture(kick);
  }, []);

  const onDoorScreen = ready && !entered;
  const showInvite = onDoorScreen && !inviteDismissed;
  const gesturesActive = onDoorScreen && inviteDismissed && phase !== "complete";

  useLayoutEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInviteDismissed(true);
      return;
    }
    if (!inviteDismissed) {
      doorEngine.resetWaiting();
    }
  }, [ready, inviteDismissed]);

  const handleInviteDismiss = useCallback(() => {
    setInviteDismissed(true);
    doorEngine.resetWaiting();
  }, []);

  useDoorGestures({ active: gesturesActive, onEngaged: onDoorEngaged, scrollRef });

  useEffect(() => {
    if (doorProgress < 0.05) return;
    startDoorTransitionPreload();
    prefetchShopChunk();
  }, [doorProgress]);

  useEffect(() => {
    if (!entered) return;
    startShopPreload();
  }, [entered]);

  useEffect(() => {
    if (entered) stopBoutiqueAudio();
  }, [entered]);

  useEffect(() => {
    if (!onDoorScreen || doorProgress < 0.01) return;
    startBoutiqueAudioFromGesture(doorProgress);
  }, [onDoorScreen, doorProgress]);

  const shopReveal = entered ? 1 : Math.min(1, Math.max(0, (doorProgress - 0.05) / 0.42));
  const doorOpacity = Math.min(1, Math.max(0, canvasOpacity));

  return (
    <div className="relative h-full w-full bg-maj-cream">
      <Loader onComplete={handleLoadComplete} />

      {ready && (entered || doorProgress > 0.03) && (
        <div
          className="shop-room-bg pointer-events-none fixed inset-0 z-[1] transition-opacity duration-700 ease-out"
          style={{ opacity: shopReveal }}
        >
          <BoutiqueBackground />
        </div>
      )}

      {ready && (
        <DoorChimeAudio
          active={ready}
          doorProgress={doorProgress}
          doorScreenActive={onDoorScreen}
        />
      )}

      {onDoorScreen && (
        <div
          className={`door-screen fixed inset-0 z-[6] transition-[filter] duration-700 ease-out ${
            showInvite ? "door-scene--blurred" : ""
          }`}
        >
          <DoorBackground fadeProgress={doorProgress} />
          <BrightnessWash intensity={brightness} />
        </div>
      )}

      {entered && (
        <Suspense fallback={null}>
          <ShopExperience visible showBackground={false} />
        </Suspense>
      )}

      {ready && !entered && (
        <DoorSceneCanvas
          progressRef={progressRef}
          animRef={animRef}
          brightness={brightness}
          opacity={doorOpacity}
          blurred={showInvite}
        />
      )}

      {showInvite && <DoorScrollInvite onDismiss={handleInviteDismiss} />}

      {gesturesActive && (
        <div
          ref={scrollRef}
          className="door-gesture-layer fixed inset-0 z-[30] overflow-y-auto overscroll-none"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          onWheel={(e) => {
            e.preventDefault();
            const kick = scrollKickFromWheel(e.deltaY);
            if (engage(kick)) {
              onDoorEngaged(kick);
            }
          }}
        >
          <div className="h-[200vh] w-full" aria-hidden />
        </div>
      )}
    </div>
  );
}

export default function BoutiqueExperience() {
  return (
    <LoadingProvider>
      <BoutiqueExperienceInner />
    </LoadingProvider>
  );
}
