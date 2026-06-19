import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/data/products";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const productEntries = getAllProductSlugs().map((slug) => ({
    url: `${siteConfig.url}/shop/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/doors`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.88,
    },
    {
      url: `${siteConfig.url}/shop`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...productEntries,
  ];
}
