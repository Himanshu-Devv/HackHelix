// BreakTimer — 10-min countdown
import React, { useState, useEffect } from 'react';
import { BREAK_DURATION } from '../../utils/constants';

export default function BreakTimer({ onComplete }) {
  const [remaining, setRemaining] = useState(BREAK_DURATION);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Break ends in</p>
      <p className="text-4xl font-light text-gray-300 font-mono tracking-wider">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </p>
    </div>
  );
}
