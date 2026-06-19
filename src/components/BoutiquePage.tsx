"use client";

import dynamic from "next/dynamic";

const BoutiqueExperience = dynamic(() => import("./BoutiqueExperience"), {
  ssr: false,
});

export default function BoutiquePage() {
  return <BoutiqueExperience />;
}
