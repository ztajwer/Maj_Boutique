"use client";

import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import { Environment, EnvironmentMap } from "@react-three/drei";
import { EquirectangularReflectionMapping, type Texture } from "three";
import { RGBELoader } from "three-stdlib";

const HDR_CACHE_VERSION = "2";

/** Self-hosted HDR with cache-bust — avoids stale 404 responses in the browser. */
export const HDRI_APARTMENT = `/hdri/lebombo_1k.hdr?v=${HDR_CACHE_VERSION}`;
export const HDRI_LOBBY = `/hdri/st_fagans_interior_1k.hdr?v=${HDR_CACHE_VERSION}`;

const PRESET_BY_VARIANT = {
  apartment: "apartment",
  lobby: "lobby",
} as const;

type EnvMode = "local" | "preset" | "off";

interface BoutiqueEnvironmentProps {
  variant?: "apartment" | "lobby";
  environmentIntensity?: number;
}

function hdrUrl(path: string) {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).href;
}

function loadHdrTexture(path: string): Promise<Texture> {
  const url = hdrUrl(path);

  return new Promise((resolve, reject) => {
    new RGBELoader().load(
      url,
      (texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        resolve(texture);
      },
      undefined,
      (error) => {
        reject(error instanceof Error ? error : new Error(`Could not load ${url}`));
      },
    );
  });
}

class PresetErrorBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[BoutiqueEnvironment] Preset HDR failed:", error.message);
    this.props.onFail();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function LocalHdrEnvironment({
  file,
  environmentIntensity,
  onFailed,
}: {
  file: string;
  environmentIntensity: number;
  onFailed: () => void;
}) {
  const [map, setMap] = useState<Texture | null>(null);

  useEffect(() => {
    let active = true;
    let texture: Texture | null = null;

    loadHdrTexture(file)
      .then((loaded) => {
        if (!active) {
          loaded.dispose();
          return;
        }
        texture = loaded;
        setMap(loaded);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[BoutiqueEnvironment] Local HDR unavailable:", message);
        onFailed();
      });

    return () => {
      active = false;
      texture?.dispose();
      setMap(null);
    };
  }, [file, onFailed]);

  if (!map) return null;

  return (
    <EnvironmentMap
      map={map}
      background={false}
      environmentIntensity={environmentIntensity}
    />
  );
}

export default function BoutiqueEnvironment({
  variant = "apartment",
  environmentIntensity = 0.62,
}: BoutiqueEnvironmentProps) {
  const [mode, setMode] = useState<EnvMode>("local");
  const file = variant === "lobby" ? HDRI_LOBBY : HDRI_APARTMENT;

  const usePreset = useCallback(() => setMode("preset"), []);
  const turnOff = useCallback(() => setMode("off"), []);

  if (mode === "off") return null;

  if (mode === "preset") {
    return (
      <PresetErrorBoundary onFail={turnOff}>
        <Environment
          preset={PRESET_BY_VARIANT[variant]}
          environmentIntensity={environmentIntensity}
          background={false}
        />
      </PresetErrorBoundary>
    );
  }

  return (
    <LocalHdrEnvironment
      file={file}
      environmentIntensity={environmentIntensity}
      onFailed={usePreset}
    />
  );
}
