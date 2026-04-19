// HysteresisCountdown — "Adapting in Xs…" display
import React from 'react';

export default function HysteresisCountdown({ pendingBand, countdown }) {
  if (!pendingBand || countdown <= 0) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium animate-pulse-soft"
      style={{
        backgroundColor: `${pendingBand.color}15`,
        color: pendingBand.color,
        border: `1px solid ${pendingBand.color}30`,
      }}
    >
      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>
        Adapting to <strong>{pendingBand.label}</strong> in {countdown}s…
      </span>
    </div>
  );
}
