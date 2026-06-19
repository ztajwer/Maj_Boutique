"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-maj-cream px-6">
      <p className="font-serif text-lg tracking-wide text-maj-brown">MAJ Boutique</p>
      <p className="font-sans text-sm text-maj-brown-mid">The experience is loading. Please refresh the page.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="font-sans text-[10px] uppercase tracking-[0.3em] text-maj-gold transition hover:text-maj-brown"
      >
        Try again
      </button>
      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-lg overflow-auto text-[10px] text-maj-brown-mid/60">{error.message}</pre>
      )}
    </div>
  );
}
