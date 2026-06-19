"use client";

import dynamic from "next/dynamic";

const HomeExperience = dynamic(() => import("./HomeExperience"), {
  ssr: false,
});

export default function BoutiquePage() {
  return <HomeExperience />;
}
