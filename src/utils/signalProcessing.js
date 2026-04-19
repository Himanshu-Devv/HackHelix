// ============================================
// Signal Processing — Z-score, Sigmoid, Scoring
// ============================================
// ML_HOOK: computeCognitiveScore() will be replaced by model.predict()

import { SIGNAL_BASELINES, MIN_SIGNALS_REQUIRED } from './constants';

/**
 * Compute z-score: how many standard deviations from baseline
 */
export function computeZScore(value, mean, std) {
  if (std === 0) return 0;
  return (value - mean) / std;
}

/**
 * Sigmoid clamping — maps any z-score to [0, 1]
 * Uses logistic function centered at 0
 */
export function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Compute cognitive load score from raw signal values
 * ML_HOOK: This entire function will be replaced by model inference
 * 
 * @param {Object} signals - raw signal values { typingRhythm, backspaceBursts, ... }
 * @param {Object} weights - per-signal weights { typingRhythm: 1.0, ... }
 * @param {Object} baselines - per-signal { mean, std }
 * @returns {number|null} score 0-100, or null if insufficient signals
 */
export function computeCognitiveScore(signals, weights, baselines) {
  const bl = baselines || SIGNAL_BASELINES;
  
  let activeCount = 0;
  let weightedSum = 0;
  let totalWeight = 0;

  const signalKeys = Object.keys(bl);

  for (const key of signalKeys) {
    const value = signals[key];
    if (value === null || value === undefined) continue;
    
    activeCount++;
    const { mean, std } = bl[key];
    const w = weights[key] ?? 1.0;

    let z;
    if (key === 'typingSpeedWPM' || key === 'cursorSpeedPxMs') {
      // For speeds, slower indicates higher fatigue. Invert the difference from mean.
      z = computeZScore(mean - (value - mean), mean, std);
    } else {
      z = computeZScore(value, mean, std);
    }
    const normalized = sigmoid(z); // [0, 1]
    weightedSum += normalized * w;
    totalWeight += w;
  }

  // Observation-only mode: fewer than 4 signals
  if (activeCount < MIN_SIGNALS_REQUIRED) {
    return null;
  }

  if (totalWeight === 0) return null;

  // Scale to 0-100
  const score = Math.round((weightedSum / totalWeight) * 100);
  return Math.max(0, Math.min(100, score));
}

