// ManualOverride — Force-band slider
import React from 'react';
import { BANDS, BAND_ORDER } from '../../utils/constants';

export default function ManualOverride({ value, onChange }) {
  const bandIndex = value ? BAND_ORDER.indexOf(value.key) : -1;

  const handleChange = (e) => {
    const idx = Number(e.target.value);
    if (idx === -1) {
      onChange(null); // Auto mode
    } else {
      onChange(BANDS[BAND_ORDER[idx]]);
    }
  };

  return (
    <div className="space-y-1.5" id="manual-override">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-400">Manual Override</label>
        <span className="text-xs text-gray-500">
          {value ? value.label : 'Auto'}
        </span>
      </div>
      <input
        type="range"
        min="-1"
        max="3"
        value={bandIndex}
        onChange={handleChange}
        className="w-full h-1.5"
      />
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>Auto</span>
        {BAND_ORDER.map(b => (
          <span key={b} style={{ color: BANDS[b].color }}>
            {BANDS[b].emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
