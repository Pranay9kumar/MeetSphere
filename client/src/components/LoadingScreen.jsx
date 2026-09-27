import React from 'react';

/**
 * Full-screen dark glass-morphism loading overlay.
 * Shown while AuthContext is resolving or lazy chunks are loading.
 */
export default function LoadingScreen({ message = 'Restoring session' }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-container-lowest"
      role="status"
      aria-label={message}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-tertiary/10 blur-3xl" />
      </div>

      {/* Glass card */}
      <div className="relative flex flex-col items-center gap-6 rounded-3xl border border-outline-variant/60 bg-surface-container/60 px-12 py-10 shadow-glass backdrop-blur-2xl">
        {/* Logo mark */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-glow">
          <span className="material-symbols-outlined text-2xl text-on-primary">video_call</span>
        </div>

        {/* Spinner */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-outline-variant border-t-primary" />
          <div className="absolute inset-1 animate-spin rounded-full border-[2px] border-transparent border-t-tertiary/60 [animation-direction:reverse] [animation-duration:600ms]" />
        </div>

        {/* Label */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-on-surface-variant">
          {message}
        </p>
      </div>
    </div>
  );
}
