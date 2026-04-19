// TabBar — Tab navigation
import React from 'react';

const TABS = [
  { id: 'live',     label: 'Live Monitor',     icon: '📊' },
  { id: 'insights', label: 'Weekly Insights',   icon: '🕸️' },
  { id: 'history',  label: 'History',           icon: '🔔' },
  { id: 'settings', label: 'Settings',          icon: '⚙️' },
];

export default function TabBar({ activeTab, onChange }) {
  return (
    <div className="flex border-b border-white/5" id="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-3 py-3 text-xs font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'text-purple-400 tab-active'
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          <span className="mr-1">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
