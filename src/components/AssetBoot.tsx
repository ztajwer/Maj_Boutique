"use client";

import { useEffect } from "react";
import { bootCriticalAssets } from "@/lib/preloadAssets";

export default function AssetBoot() {
  useEffect(() => {
    bootCriticalAssets();
  }, []);
  return null;
}
