import { getHomeJsonLd } from "@/lib/seo";

export default function SeoJsonLd() {
  const jsonLd = getHomeJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
