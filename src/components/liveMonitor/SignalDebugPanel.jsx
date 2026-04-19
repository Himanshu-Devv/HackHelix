// SignalDebugPanel — Collapsible raw signal values
import React, { useState } from 'react';
import { SIGNAL_NAMES, SIGNAL_UNITS } from '../../utils/constants';

export default function SignalDebugPanel({ signals, activeSignalCount }) {
  const [isOpen, setIsOpen] = useState(false);

  const signalEntries = Object.entries(SIGNAL_NAMES).map(([key, name]) => {
    const value = signals[key];
    const hasData = value !== null && value !== undefined;
    const unit = SIGNAL_UNITS[key];

    let displayValue = '—';
    if (hasData) {
      if (key === 'errorRate') displayValue = (value * 100).toFixed(1) + '%';
      else if (key === 'typingSpeedWPM' || key === 'holdTimeMs' || key === 'flightTimeMs') displayValue = value.toFixed(0);
      else displayValue = value.toFixed(2);
    }

    return { key, name, displayValue, unit, hasData };
  });

  return (
    <div className="glass-card rounded-xl overflow-hidden" id="signal-debug-panel">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📊</span>
          <span className="text-gray-300 font-medium">Live Signal Readings</span>
          <span className="text-xs text-gray-500">
            ({activeSignalCount}/7 active)
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          {signalEntries.map(({ key, name, displayValue, unit, hasData }) => (
            <div
              key={key}
              className="flex items-center justify-between py-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasData ? 'bg-green-400' : 'bg-gray-600'
                  }`}
                />
                <span className="text-gray-400">{name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono ${hasData ? 'text-gray-200' : 'text-gray-600'}`}>
                  {displayValue}
                </span>
                <span className="text-gray-600 w-16 text-right">{key !== 'errorRate' ? unit : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
