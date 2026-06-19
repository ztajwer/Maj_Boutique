export const siteConfig = {
  name: "MAJ Boutique",
  title: "MAJ Boutique | Luxury Jewelry & Fashion Boutique",
  description:
    "MAJ Boutique — an immersive luxury jewelry and fashion experience. Explore curated gold jewelry, designer headpieces, necklaces, cuffs, and accessories in an elegant 3D boutique.",
  keywords: [
    "MAJ Boutique",
    "luxury jewelry",
    "luxury fashion boutique",
    "gold jewelry",
    "designer jewelry",
    "designer boutique",
    "luxury shopping",
    "fine jewelry",
    "handcrafted jewelry",
    "bridal jewelry",
    "statement necklace",
    "gold headpiece",
    "luxury accessories",
    "online jewelry boutique",
    "3D jewelry shopping",
  ],
  locale: "en_US",
  sameAs: [] as string[],
  get url() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  },
} as const;
