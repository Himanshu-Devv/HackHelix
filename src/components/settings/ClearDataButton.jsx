// ClearDataButton — Wipe all localStorage
import React, { useState } from 'react';

export default function ClearDataButton({ onClear }) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    onClear();
    setConfirming(false);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        confirming
          ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
          : 'bg-gray-800/60 border border-gray-700 text-gray-400 hover:bg-gray-700/60 hover:text-gray-300'
      }`}
      id="clear-data-button"
    >
      {confirming ? '⚠️ Click again to confirm — this will erase all your data' : '🗑️ Clear All My Data'}
    </button>
  );
}
