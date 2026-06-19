"use client";

interface DoorScrollInviteProps {
  onDismiss: () => void;
}

export default function DoorScrollInvite({ onDismiss }: DoorScrollInviteProps) {
  return (
    <div
      className="door-invite fixed inset-0 z-[40] flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="door-invite-title"
    >
      <button
        type="button"
        className="door-invite__backdrop"
        aria-label="Close invitation"
        onClick={onDismiss}
      />

      <div className="door-invite__card">
        <button
          type="button"
          className="door-invite__close"
          onClick={onDismiss}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M1 1L11 11M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="door-invite__ring" aria-hidden />
        <div className="door-invite__glow" aria-hidden />

        <div className="door-invite__content">
          <p className="door-invite__eyebrow">MAJ Boutique</p>
          <h2 id="door-invite-title" className="door-invite__title font-serif">
            Scroll to Open the Doors
          </h2>
          <p className="door-invite__sub">A gentle scroll welcomes you inside</p>
          <div className="door-invite__scroll-hint" aria-hidden>
            <span className="door-invite__scroll-line" />
            <svg className="door-invite__chevron" width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 2.5V10M7 10L3.5 6.5M7 10L10.5 6.5"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
