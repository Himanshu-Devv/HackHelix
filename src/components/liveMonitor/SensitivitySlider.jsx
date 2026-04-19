// SensitivitySlider — Sensitive ↔ Conservative
import React from 'react';

export default function SensitivitySlider({ value, onChange }) {
  return (
    <div className="space-y-1.5" id="sensitivity-slider">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-400">Sensitivity</label>
        <span className="text-xs text-gray-500">
          {value > 0 ? `+${value}` : value} pts
        </span>
      </div>
      <input
        type="range"
        min="-10"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5"
      />
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>Sensitive</span>
        <span>Conservative</span>
      </div>
    </div>
  );
}
