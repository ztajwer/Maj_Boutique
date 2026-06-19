"use client";

import { useEffect } from "react";
import { bootCriticalAssets } from "@/lib/preloadAssets";

/** Starts parallel asset downloads on first client paint. */
export default function AssetBoot() {
  useEffect(() => {
    bootCriticalAssets();
  }, []);
  return null;
}
