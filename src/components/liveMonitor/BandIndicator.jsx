// BandIndicator — Current band label + color
import React from 'react';

export default function BandIndicator({ band }) {
  if (!band) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/60 border border-gray-700">
        <span className="text-gray-500 text-lg">⬜</span>
        <span className="text-gray-400 font-semibold text-sm">Observation Only</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500"
      style={{
        backgroundColor: `${band.color}15`,
        borderColor: `${band.color}40`,
      }}
    >
      <span className="text-lg">{band.emoji}</span>
      <span className="font-semibold text-sm" style={{ color: band.color }}>
        {band.label}
      </span>
    </div>
  );
}
