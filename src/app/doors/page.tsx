import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import DoorsPageClient from "./DoorsPageClient";

export const metadata: Metadata = buildPageMetadata({
  title: `Enter | ${siteConfig.name}`,
  description: "Scroll to open the doors and enter MAJ Boutique.",
  path: "/doors",
});

export default function DoorsPage() {
  return (
    <main className="boutique-home">
      <DoorsPageClient />
    </main>
  );
}
