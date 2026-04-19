// ============================================
// useCognitiveScore — Z-score pipeline + ML Backend
// ============================================
// Workflow:
//   Every second, the raw keyEvents and mouseEvents arrays are mapped
//   and bridged natively to the locally running Python ML Backend Server.
//   If the ML Backend isn't active or fails mapping, we seamlessly fallback
//   to the legacy Z-score math algorithm.

import { useState, useEffect, useMemo } from 'react';
import { computeCognitiveScore } from '../utils/signalProcessing';
import { SIGNAL_BASELINES } from '../utils/constants';

/**
 * @param {Object} signals - rolling window exact metrics
 * @param {Array} keyEvents - raw keystrokes dict wrapper
 * @param {Array} mouseEvents - raw mouse movement dict wrapper
 * @param {Object} weights - per-signal weights from localStorage
 * @param {number} sliderValue - manual slider value
 * @param {boolean} useSlider - when true, return slider value instead of computed score
 */
export default function useCognitiveScore(signals, keyEvents, mouseEvents, weights, sliderValue, useSlider = true) {
  // We compute local signals synchronusly to ensure we ALWAYS have a fallback mechanism
  const currentSignals = useMemo(() => ({
    typingSpeedWPM:  signals.typingSpeedWPM,
    errorRate:       signals.errorRate,
    holdTimeMs:      signals.holdTimeMs,
    flightTimeMs:    signals.flightTimeMs,
    cursorSpeedPxMs: signals.cursorSpeedPxMs,
    jitterPxMs:      signals.jitterPxMs,
  }), [signals]);

  const activeSignalCount = useMemo(() => 
    Object.values(currentSignals).filter(v => v !== null).length
  , [currentSignals]);

  const computedScore = useMemo(() => 
    computeCognitiveScore(currentSignals, weights, SIGNAL_BASELINES)
  , [currentSignals, weights]);

  // State handles the Python backend logic score override
  const [modelScore, setModelScore] = useState(null);
  
  // Official stable score that only updates every 10 seconds
  const [stableScore, setStableScore] = useState(sliderValue);

  // 1. Sync Logic: Decide what the "live" raw score is
  const rawScore = useSlider ? sliderValue : (modelScore !== null ? modelScore : computedScore);

  // 2. Official 10s Pulse Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setStableScore(rawScore);
    }, 10000);
    
    // Also update immediately if we switch into/out of slider mode
    setStableScore(rawScore);

    return () => clearInterval(interval);
  }, [rawScore]);

  // Poll Python API
  useEffect(() => {
    // Prevent unneeded fetches if we are just simulating anyway
    if (useSlider) return;

    let isMounted = true;
    const fetchPrediction = async () => {
      try {
        const payload = {
          keystrokes: keyEvents.current.map(e => ({
            key: e.key,
            keydown_ms: e.keydownAt,
            keyup_ms: e.keyupAt || e.keydownAt, // Failsafe against trailing downs
          })),
          mouse_samples: mouseEvents.current.map(e => ({
            x: e.x,
            y: e.y,
            t_ms: e.t,
          })),
        };

        const res = await fetch('http://localhost:8000/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('API offline');
        
        const data = await res.json();
        if (isMounted && data.score !== undefined) {
          setModelScore(data.score); // 0-100 score model successfully retrieved
        }

      } catch (err) {
        // Backend not booted/accessible — don't crash, let it use math fallback
        if (isMounted) setModelScore(null);
      }
    };

    const interval = setInterval(fetchPrediction, 10000);
    fetchPrediction(); // Initial call

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [keyEvents, mouseEvents, useSlider]);

  return {
    score: stableScore,
    computedScore,
    sliderScore: sliderValue,
    activeSignalCount,
    currentSignals,
  };
}

