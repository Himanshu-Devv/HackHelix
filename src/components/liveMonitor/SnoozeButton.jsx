// SnoozeButton — Snooze toggle + countdown
import React from 'react';

export default function SnoozeButton({ snooze }) {
  const { isSnoozed, formattedRemaining, startSnooze, cancelSnooze } = snooze;

  if (isSnoozed) {
    return (
      <button
        onClick={cancelSnooze}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
        id="snooze-button"
      >
        <span>😴</span>
        <span>Snoozed — {formattedRemaining} remaining</span>
        <span className="text-amber-500/60 ml-1">Cancel</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => startSnooze()}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-400 text-xs font-medium hover:bg-gray-700/60 hover:text-gray-300 transition-colors"
      id="snooze-button"
    >
      <span>😴</span>
      <span>Snooze (30 min)</span>
    </button>
  );
}
