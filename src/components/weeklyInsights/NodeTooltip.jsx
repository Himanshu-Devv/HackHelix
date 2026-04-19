// NodeTooltip — Hover tooltip
import React from 'react';

export default function NodeTooltip({ text, x, y }) {
  if (!text) return null;

  return (
    <div
      className="absolute z-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl text-xs text-gray-200 max-w-xs pointer-events-none graph-tooltip"
      style={{
        left: `${Math.min(x, 500)}px`,
        top: `${y - 40}px`,
        opacity: 1,
      }}
    >
      {text}
      <div
        className="absolute w-2 h-2 bg-gray-800 border-b border-r border-gray-600 rotate-45"
        style={{ bottom: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }}
      />
    </div>
  );
}
