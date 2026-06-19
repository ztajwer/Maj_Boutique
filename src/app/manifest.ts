import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "MAJ",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6F1",
    theme_color: "#FAF6F1",
    lang: "en-US",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
