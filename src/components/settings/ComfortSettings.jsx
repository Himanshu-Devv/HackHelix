// ComfortSettings — Individual comfort toggles
import React from 'react';

const COMFORT_OPTIONS = [
  { key: 'warmFilter',    label: 'Warm color filter',    desc: 'Sepia 15% + brightness 95%', icon: '🌅' },
  { key: 'fontBoost',     label: 'Font size boost',      desc: 'All text +3px above current', icon: '🔤' },
  { key: 'reducedMotion', label: 'Reduced motion',       desc: 'Disable all animations',       icon: '🚫' },
  { key: 'lowContrast',   label: 'Low contrast mode',    desc: 'Contrast 90% — easier on eyes', icon: '🌙' },
  { key: 'focusMode',     label: 'Focus mode',           desc: 'Hide sidebars and widgets',     icon: '🎯' },
  { key: 'lineSpacing',   label: 'Line spacing increase',desc: 'Line-height 1.9 across text',   icon: '📏' },
];

export default function ComfortSettings({ settings, onToggle }) {
  return (
    <div className="space-y-2" id="comfort-settings">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        Comfort Settings
      </h3>
      {COMFORT_OPTIONS.map(({ key, label, desc, icon }) => (
        <label
          key={key}
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
        >
          <span className="text-base">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-300 font-medium">{label}</div>
            <div className="text-[10px] text-gray-500">{desc}</div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings[key] || false}
              onChange={() => onToggle(key)}
              className="sr-only"
            />
            <div className={`w-8 h-4 rounded-full transition-colors ${
              settings[key] ? 'bg-purple-500' : 'bg-gray-700'
            }`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
              settings[key] ? 'translate-x-4' : ''
            }`} />
          </div>
        </label>
      ))}
    </div>
  );
}
