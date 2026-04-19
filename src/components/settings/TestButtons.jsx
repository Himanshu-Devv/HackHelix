// TestButtons — Trigger popup / simulate crash
import React from 'react';

export default function TestButtons({ onTriggerPopup, onSimulateCrash }) {
  return (
    <div className="space-y-2" id="test-buttons">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        Demo & Testing
      </h3>
      <button
        onClick={onTriggerPopup}
        className="w-full px-4 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-colors"
      >
        🧪 Trigger Test Popup
      </button>
      <button
        onClick={onSimulateCrash}
        className="w-full px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
      >
        💥 Simulate Crash Pattern
        <span className="block text-[10px] text-red-500/60 mt-0.5">
          Score → 85 then drops to 45 over 10s
        </span>
      </button>
    </div>
  );
}
