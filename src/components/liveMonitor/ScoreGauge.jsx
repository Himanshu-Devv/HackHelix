// ============================================
// ScoreGauge — CSS semicircle gauge (0–100)
// ============================================

import React from 'react';
import { getBandFromScore } from '../../utils/constants';

export default function ScoreGauge({ score, sensitivity }) {
  const band = score !== null ? getBandFromScore(score, sensitivity) : null;
  const isObservation = score === null;

  // SVG semicircle — arc from 0 to 180 degrees
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * radius; // half circle
  const progress = isObservation ? 0 : (score / 100) * circumference;
  const dashOffset = circumference - progress;

  const strokeColor = band ? band.color : '#4b5563';

  // Create arc path (semicircle, left to right)
  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  return (
    <div className="flex flex-col items-center" id="score-gauge">
      <div className="relative w-52 h-28">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Track */}
          <path
            d={arcPath}
            className="gauge-track"
            strokeWidth="12"
            fill="none"
            stroke="#2a2a35"
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={arcPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
            }}
          />
          {/* Score glow effect */}
          {!isObservation && (
            <path
              d={arcPath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              opacity="0.3"
              filter="blur(6px)"
              style={{
                transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
              }}
            />
          )}
        </svg>

        {/* Score number in center */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          {isObservation ? (
            <span className="text-4xl font-bold text-gray-500">—</span>
          ) : (
            <span
              className="text-4xl font-bold transition-colors duration-500"
              style={{ color: strokeColor }}
            >
              {score}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <p className="text-xs text-gray-500 mt-1">
        {isObservation ? 'Observation Mode' : 'Cognitive Load Score'}
      </p>
    </div>
  );
}
