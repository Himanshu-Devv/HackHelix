// ============================================
// useHysteresis — Countdown + band transition logic
// ============================================
// Hysteresis prevents UI flickering:
// - Score must stay above threshold for 90s (or 5s demo) before adaptations fire
// - Score must drop 10 points below threshold before reverting

import { useState, useEffect, useRef, useCallback } from 'react';
import { getBandFromScore, HYSTERESIS_DURATION_NORMAL, HYSTERESIS_DURATION_DEMO, HYSTERESIS_REVERT_MARGIN, BAND_ORDER } from '../utils/constants';

export default function useHysteresis(score, sensitivityOffset, demoMode, snoozed, manualOverrideBand) {
  const [confirmedBand, setConfirmedBand] = useState(null);
  const [pendingBand, setPendingBand] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const pendingBandRef = useRef(null);

  const hysteresisDuration = demoMode ? HYSTERESIS_DURATION_DEMO : HYSTERESIS_DURATION_NORMAL;

  // Get the target band from current score
  const targetBand = score !== null ? getBandFromScore(score, sensitivityOffset) : null;

  useEffect(() => {
    // Manual override bypasses hysteresis
    if (manualOverrideBand) {
      setConfirmedBand(manualOverrideBand);
      setPendingBand(null);
      setCountdown(0);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    // Snoozed — force Focused band
    if (snoozed) {
      setConfirmedBand(null);
      setPendingBand(null);
      setCountdown(0);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    if (!targetBand) {
      // Observation-only mode
      setPendingBand(null);
      setCountdown(0);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    const currentBandKey = confirmedBand?.key || 'FOCUSED';
    const targetBandKey = targetBand.key;

    // Check if target band is different from confirmed
    if (targetBandKey === currentBandKey) {
      // Same band — clear any pending transition
      if (pendingBandRef.current !== null) {
        setPendingBand(null);
        setCountdown(0);
        pendingBandRef.current = null;
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
      return;
    }

    // Check for revert: must drop 10 points below current band's min threshold
    const currentIdx = BAND_ORDER.indexOf(currentBandKey);
    const targetIdx = BAND_ORDER.indexOf(targetBandKey);
    
    if (targetIdx < currentIdx) {
      // Going down — check revert margin
      const currentMin = confirmedBand?.min ?? 0;
      if (score > currentMin - HYSTERESIS_REVERT_MARGIN) {
        // Not low enough to revert yet
        return;
      }
    }

    // Start countdown for band transition if not already running FOR THIS SPECIFIC TARGET
    if (pendingBandRef.current !== targetBandKey) {
      pendingBandRef.current = targetBandKey;
      setPendingBand(targetBand);
      setCountdown(hysteresisDuration);

      if (countdownRef.current) clearInterval(countdownRef.current);
      
      const startTime = Date.now();
      countdownRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = hysteresisDuration - elapsed;
        
        if (remaining <= 0) {
          // Countdown complete — confirm band transition
          setConfirmedBand(targetBand);
          setPendingBand(null);
          setCountdown(0);
          pendingBandRef.current = null;
          clearInterval(countdownRef.current);
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    }

    // Note: We deliberately EXCLUDE score from dependencies to prevent the interval 
    // from being destroyed every second by the cleanup function.
    return () => {
      // No-op cleanup for score jitters
    };
  }, [targetBandKey, confirmedBand, hysteresisDuration, sensitivityOffset, snoozed, manualOverrideBand]);

  // Force revert all adaptations
  const forceRevert = useCallback(() => {
    setConfirmedBand(null);
    setPendingBand(null);
    setCountdown(0);
    pendingBandRef.current = null;
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // Force apply a band immediately (for post-break)
  const forceApplyBand = useCallback((band) => {
    setConfirmedBand(band);
    setPendingBand(null);
    setCountdown(0);
    pendingBandRef.current = null;
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  return {
    confirmedBand,
    pendingBand,
    countdown,
    forceRevert,
    forceApplyBand,
  };
}
