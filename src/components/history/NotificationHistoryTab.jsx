// NotificationHistoryTab — Tab 3 container
import React, { useState } from 'react';
import storage from '../../utils/storage';
import HistoryEntry from './HistoryEntry';

export default function NotificationHistoryTab() {
  const [isExpanded, setIsExpanded] = useState(true);
  const history = storage.get('notification_history') || [];

  return (
    <div className="max-w-lg mx-auto space-y-4" id="notification-history-tab">
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🔔</span>
            <span className="text-sm font-medium text-gray-300">Notification History</span>
            <span className="text-xs text-gray-500">({history.length})</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-4 pb-3">
            {history.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-600 text-xs mt-1">
                  Your fatigue patterns will appear here
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {history.map((entry, i) => (
                  <HistoryEntry key={`${entry.timestamp}-${i}`} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
