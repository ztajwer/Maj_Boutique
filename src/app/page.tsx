import type { Metadata } from "next";
import BoutiquePage from "@/components/BoutiquePage";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  return (
    <main className="boutique-home">
      <BoutiquePage />
    </main>
  );
}
