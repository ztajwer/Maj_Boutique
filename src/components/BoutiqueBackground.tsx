"use client";

/** Background zoom — CSS @keyframes for consistent Chrome/Safari rendering. */
export default function BoutiqueBackground() {
  return (
    <div className="shop-room-bg__frame" aria-hidden>
      <div className="shop-room-bg__zoom">
        <img
          src="/background.png"
          alt=""
          width={1655}
          height={950}
          className="shop-room-bg__image"
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
      </div>
    </div>
  );
}
