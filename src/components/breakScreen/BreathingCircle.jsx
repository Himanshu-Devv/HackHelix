// BreathingCircle — 4s inhale / 6s exhale animation
import React, { useState, useEffect } from 'react';

export default function BreathingCircle() {
  const [phase, setPhase] = useState('inhale'); // 'inhale' or 'exhale'

  useEffect(() => {
    const cycle = () => {
      setPhase('inhale');
      const exhaleTimer = setTimeout(() => setPhase('exhale'), 4000);
      const nextCycle = setTimeout(cycle, 10000);
      return () => {
        clearTimeout(exhaleTimer);
        clearTimeout(nextCycle);
      };
    };
    const cleanup = cycle();
    return cleanup;
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="breathing-circle w-40 h-40 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.05) 70%, transparent 100%)',
          border: '2px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 40px rgba(168, 85, 247, 0.1), inset 0 0 40px rgba(168, 85, 247, 0.05)',
        }}
      >
        <div className="text-center">
          <div className="text-3xl mb-1">
            {phase === 'inhale' ? '🌬️' : '💨'}
          </div>
        </div>
      </div>
      
      <p className="text-lg font-light text-gray-300 tracking-wide animate-pulse-soft">
        {phase === 'inhale' ? 'Breathe in…' : 'Breathe out…'}
      </p>
    </div>
  );
}
