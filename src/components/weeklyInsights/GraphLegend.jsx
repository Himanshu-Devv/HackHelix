// GraphLegend — Node type legend
import React from 'react';

const LEGEND_ITEMS = [
  { color: '#f97316', label: 'High drain app', shape: 'circle' },
  { color: '#eab308', label: 'Medium drain app', shape: 'circle' },
  { color: '#14b8a6', label: 'Low drain app', shape: 'circle' },
  { color: '#a855f7', label: 'Fatigue state', shape: 'circle' },
  { color: '#3b82f6', label: 'ADHD symptom', shape: 'circle' },
];

export default function GraphLegend() {
  return (
    <div className="flex flex-wrap gap-3 justify-center py-2">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full border"
            style={{
              backgroundColor: `${item.color}30`,
              borderColor: item.color,
            }}
          />
          <span className="text-[10px] text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
