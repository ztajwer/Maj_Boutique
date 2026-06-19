import Link from "next/link";

/** Crawler-visible copy — does not affect the immersive UI */
export default function HomeSeoContent() {
  return (
    <div className="sr-only">
      <h1>{`MAJ Boutique — Luxury Jewelry & Fashion`}</h1>
      <p>
        Welcome to MAJ Boutique, an immersive luxury jewelry and fashion experience.
        Scroll to open the golden doors and explore curated gold jewelry, designer
        headpieces, necklaces, cuffs, and accessories in our 3D boutique.
      </p>
      <nav aria-label="Site sections">
        <ul>
          <li>
            <Link href="/shop">Shop the MAJ jewelry collection</Link>
          </li>
          <li>
            <Link href="/doors">Enter through the boutique doors</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
