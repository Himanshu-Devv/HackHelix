// FeedbackPill — "Feeling fine?" / "Yes I needed that"
import React from 'react';

export default function FeedbackPill({ onRevert, onConfirm }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex items-center gap-1 animate-slide-up"
      id="feedback-pill"
    >
      <button
        onClick={onRevert}
        className="pill-button px-3 py-2 rounded-l-full bg-gray-800/90 backdrop-blur border border-gray-700 text-xs text-gray-300 hover:text-white hover:bg-gray-700/90 transition-all"
      >
        😊 Feeling fine? Stop adapting
      </button>
      <button
        onClick={onConfirm}
        className="pill-button px-3 py-2 rounded-r-full bg-gray-800/90 backdrop-blur border border-gray-700 border-l-0 text-xs text-gray-500 hover:text-emerald-400 hover:bg-gray-700/90 transition-all"
      >
        ✓ Yes, I needed that
      </button>
    </div>
  );
}
