"use client";

import dynamic from "next/dynamic";

const BoutiqueExperience = dynamic(() => import("@/components/BoutiqueExperience"), {
  ssr: false,
});

export default function DoorsPageClient() {
  return <BoutiqueExperience />;
}
