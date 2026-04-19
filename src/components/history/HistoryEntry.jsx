// HistoryEntry — Individual notification history card
import React from 'react';

const TRIGGER_LABELS = {
  sustained_drain: '🔥 Sustained Drain',
  cumulative_fatigue: '🧠 Cumulative Fatigue',
  crash_pattern: '💥 Crash Pattern',
  post_crash_drift: '🌊 Post-Crash Drift',
  app_repeat: '🔁 Repeat Offender',
  break_completed: '🌿 Break Completed',
  test: '🧪 Test Popup',
};

const ACTION_COLORS = {
  Break: 'text-emerald-400',
  'Adjust UI': 'text-blue-400',
  Dismissed: 'text-gray-500',
};

export default function HistoryEntry({ entry }) {
  const date = new Date(entry.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="text-right min-w-[4.5rem]">
        <div className="text-xs text-gray-400">{timeStr}</div>
        <div className="text-[10px] text-gray-600">{dateStr}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-300">
          {TRIGGER_LABELS[entry.triggerType] || entry.triggerType}
        </div>
        {entry.domain && (
          <div className="text-[10px] text-gray-500 truncate">
            App: {entry.domain}
          </div>
        )}
      </div>

      <span className={`text-xs font-medium ${ACTION_COLORS[entry.action] || 'text-gray-400'}`}>
        {entry.action}
      </span>
    </div>
  );
}
