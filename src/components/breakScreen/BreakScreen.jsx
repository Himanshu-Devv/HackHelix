// BreakScreen — Fullscreen break overlay
import React from 'react';
import BreathingCircle from './BreathingCircle';
import BreakTimer from './BreakTimer';
import useBrownNoise from '../../hooks/useBrownNoise';

export default function BreakScreen({ onEnd }) {
  const brownNoise = useBrownNoise();

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10"
      style={{ backgroundColor: 'rgba(15, 15, 22, 0.95)' }}
      id="break-screen"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <h2 className="text-lg font-light text-gray-400 tracking-widest uppercase">
          Take a moment
        </h2>

        <BreathingCircle />

        <BreakTimer onComplete={onEnd} />

        {/* Brown noise toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={brownNoise.toggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              brownNoise.isPlaying
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                : 'bg-gray-800/40 border border-gray-700 text-gray-500 hover:text-gray-400'
            }`}
          >
            <span>{brownNoise.isPlaying ? '🔊' : '🔇'}</span>
            <span>Ambient Sound {brownNoise.isPlaying ? 'On' : 'Off'}</span>
          </button>

          {brownNoise.isPlaying && (
            <input
              type="range"
              min="0"
              max="100"
              value={brownNoise.volume * 100}
              onChange={(e) => brownNoise.setVolume(Number(e.target.value) / 100)}
              className="w-20 h-1"
            />
          )}

          {!brownNoise.isAvailable && (
            <span className="text-xs text-gray-600">(Audio unavailable in this browser)</span>
          )}
        </div>

        {/* Exit button */}
        <button
          onClick={onEnd}
          className="mt-4 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 hover:text-gray-300 transition-all"
        >
          I'm ready to return →
        </button>
      </div>
    </div>
  );
}
