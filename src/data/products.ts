export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: "USD";
  category: string;
  glbPath: string;
  tableSlot: number;
  highlights: string[];
  material: string;
};

export const products: Product[] = [
  {
    id: "pro-1",
    slug: "celestial-crown",
    name: "Celestial Crown",
    tagline: "Regal heritage headpiece",
    description:
      "An ornate crown crafted for ceremonial elegance — filigree goldwork, sapphire accents, and a silhouette that commands the room with quiet majesty.",
    price: 4280,
    currency: "USD",
    category: "Headpiece",
    glbPath: "/pro1.glb",
    tableSlot: 0,
    highlights: ["Hand-finished goldwork", "Sapphire crystal accents", "Limited atelier edition"],
    material: "18K gold plate · crystal",
  },
  {
    id: "pro-2",
    slug: "aurora-pendant",
    name: "Aurora Pendant",
    tagline: "Luminous evening statement",
    description:
      "A suspended pendant that catches every beam of light — designed to float above the neckline with a soft, radiant glow.",
    price: 2890,
    currency: "USD",
    category: "Pendant",
    glbPath: "/pro2.glb",
    tableSlot: 1,
    highlights: ["Floating silhouette", "Warm rose-gold finish", "Signature MAJ clasp"],
    material: "Rose gold · pearl accent",
  },
  {
    id: "pro-3",
    slug: "heritage-necklace",
    name: "Heritage Necklace",
    tagline: "Timeless layered luxury",
    description:
      "Layered chains and medallions inspired by archival MAJ designs — a centerpiece that bridges heritage craft and modern refinement.",
    price: 3650,
    currency: "USD",
    category: "Necklace",
    glbPath: "/pro3.glb",
    tableSlot: 2,
    highlights: ["Multi-strand design", "Antique-inspired medallion", "Adjustable length"],
    material: "Gold vermeil · enamel",
  },
  {
    id: "pro-4",
    slug: "opaline-cuff",
    name: "Opaline Cuff",
    tagline: "Sculpted wrist adornment",
    description:
      "A bold cuff with opalescent depth and architectural curves — structured enough to stand alone, refined enough for evening pairing.",
    price: 2140,
    currency: "USD",
    category: "Cuff",
    glbPath: "/pro4.glb",
    tableSlot: 3,
    highlights: ["Sculptural form", "Opaline sheen", "Comfort-fit interior"],
    material: "Polished gold · opaline resin",
  },
  {
    id: "pro-5",
    slug: "sovereign-clutch",
    name: "Sovereign Clutch",
    tagline: "Evening companion",
    description:
      "A compact clutch with couture detailing — the finishing touch for a curated ensemble, presented as wearable art.",
    price: 1920,
    currency: "USD",
    category: "Accessory",
    glbPath: "/pro5.glb",
    tableSlot: 4,
    highlights: ["Couture clasp", "Soft structured body", "Interior suede lining"],
    material: "Leather · gold hardware",
  },
];

export const PRODUCT_PATHS = products.map((product) => product.glbPath) as readonly string[];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductBySlot(slot: number): Product | undefined {
  return products.find((product) => product.tableSlot === slot);
}

export function getAllProductSlugs(): string[] {
  return products.map((product) => product.slug);
}

export function formatProductPrice(price: number, currency: Product["currency"] = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
