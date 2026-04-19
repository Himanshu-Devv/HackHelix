// ============================================
// usePopupTrigger — Smart popup trigger conditions
// ============================================
// This is the most complex hook in the project.
// It maintains its own internal time-series history of scores to detect patterns.
// All 5 trigger conditions are genuinely evaluated against accumulated data.

import { useState, useEffect, useRef, useCallback } from 'react';
import storage from '../utils/storage';
import {
  POPUP_COOLDOWN,
  POPUP_SUSTAINED_DRAIN_MINUTES,
  POPUP_CUMULATIVE_HOURS,
  POPUP_CUMULATIVE_THRESHOLD,
  POPUP_CRASH_DROP,
  POPUP_CRASH_SPIKE,
  POPUP_POST_CRASH_DRIFT_MINUTES,
  POPUP_REPEAT_COUNT,
} from '../utils/constants';

export default function usePopupTrigger(score, currentDomain, confirmedBandKey) {
  const [shouldShowPopup, setShouldShowPopup] = useState(false);
  const [triggerType, setTriggerType] = useState(null);
  const [triggerDomain, setTriggerDomain] = useState(null);
  const [triggerData, setTriggerData] = useState({});

  // Internal time-series history
  const scoreHistory = useRef([]); // {score, timestamp}
  const crashDetected = useRef(false);
  const crashTimestamp = useRef(null);
  const currentDomainStartTime = useRef(Date.now());
  const currentDomainScores = useRef([]);
  const lastDomain = useRef(currentDomain);

  // Track domain changes
  useEffect(() => {
    if (currentDomain !== lastDomain.current) {
      lastDomain.current = currentDomain;
      currentDomainStartTime.current = Date.now();
      currentDomainScores.current = [];
    }
  }, [currentDomain]);

  // Record band counts for repeat offender detection
  useEffect(() => {
    if (!currentDomain || !confirmedBandKey) return;
    if (confirmedBandKey !== 'OVERLOADED' && confirmedBandKey !== 'FATIGUED') return;

    const today = new Date().toISOString().split('T')[0];
    const counts = storage.get('popup_counts') || {};
    
    if (!counts[currentDomain]) {
      counts[currentDomain] = { overloaded: 0, fatigued: 0, date: today };
    }
    
    // Reset daily counts if date changed
    if (counts[currentDomain].date !== today) {
      counts[currentDomain] = { overloaded: 0, fatigued: 0, date: today };
    }

    const bandCountKey = confirmedBandKey.toLowerCase();
    counts[currentDomain][bandCountKey] = (counts[currentDomain][bandCountKey] || 0) + 1;
    storage.set('popup_counts', counts);
  }, [currentDomain, confirmedBandKey]);

  // Main trigger evaluation — every second
  useEffect(() => {
    if (score === null || score === undefined) return;

    const interval = setInterval(() => {
      const now = Date.now();

      // Append to history
      scoreHistory.current.push({ score, timestamp: now });
      currentDomainScores.current.push({ score, timestamp: now });

      // Prune entries older than 3 hours
      const threeHoursAgo = now - 3 * 60 * 60 * 1000;
      scoreHistory.current = scoreHistory.current.filter(e => e.timestamp > threeHoursAgo);

      // Check 2-hour cooldown
      const lastPopup = storage.get('last_popup_time') || 0;
      if (now - lastPopup < POPUP_COOLDOWN) return;

      // Already showing a popup
      if (shouldShowPopup) return;

      let fired = false;
      let type = null;
      let data = {};

      // 1. High sustained drain — score >65 for 25+ continuous minutes
      const drainWindowMs = POPUP_SUSTAINED_DRAIN_MINUTES * 60 * 1000;
      const drainEntries = currentDomainScores.current.filter(e => e.timestamp > now - drainWindowMs);
      if (drainEntries.length > 10 && drainEntries.every(e => e.score > 65)) {
        const minsSinceStart = Math.round((now - currentDomainStartTime.current) / 60000);
        type = 'sustained_drain';
        data = { domain: currentDomain, minutes: minsSinceStart, score };
        fired = true;
      }

      // 2. Cumulative fatigue — avg over last 2-3 hours > 60
      if (!fired) {
        const cumWindowMs = POPUP_CUMULATIVE_HOURS * 60 * 60 * 1000;
        const cumEntries = scoreHistory.current.filter(e => e.timestamp > now - cumWindowMs);
        if (cumEntries.length > 30) {
          const avg = cumEntries.reduce((a, e) => a + e.score, 0) / cumEntries.length;
          if (avg > POPUP_CUMULATIVE_THRESHOLD) {
            type = 'cumulative_fatigue';
            data = { avgScore: Math.round(avg), hours: POPUP_CUMULATIVE_HOURS };
            fired = true;
          }
        }
      }

      // 3. Crash pattern — spike >80 then drop 20+ points
      if (!fired) {
        const fiveMinAgo = now - 5 * 60 * 1000;
        const recentHigh = scoreHistory.current.filter(
          e => e.timestamp > fiveMinAgo && e.score >= POPUP_CRASH_SPIKE
        );
        if (recentHigh.length > 0) {
          const peakScore = Math.max(...recentHigh.map(e => e.score));
          if (peakScore - score >= POPUP_CRASH_DROP) {
            crashDetected.current = true;
            crashTimestamp.current = now;
            type = 'crash_pattern';
            data = { peakScore, currentScore: score };
            fired = true;
          }
        }
      }

      // 4. Post-crash drift — after crash, score 55-70 for 20+ minutes
      if (!fired && crashDetected.current && crashTimestamp.current) {
        const driftWindowMs = POPUP_POST_CRASH_DRIFT_MINUTES * 60 * 1000;
        const sincesCrash = now - crashTimestamp.current;
        if (sincesCrash > driftWindowMs) {
          const driftEntries = scoreHistory.current.filter(
            e => e.timestamp > crashTimestamp.current && e.timestamp > now - driftWindowMs
          );
          if (driftEntries.length > 10 && driftEntries.every(e => e.score >= 55 && e.score <= 70)) {
            type = 'post_crash_drift';
            data = { minutes: Math.round(sincesCrash / 60000), score };
            fired = true;
            crashDetected.current = false;
          }
        }
      }

      // 5. App-specific repeat — same app triggered 3+ times today
      if (!fired && currentDomain) {
        const today = new Date().toISOString().split('T')[0];
        const counts = storage.get('popup_counts') || {};
        const domainCounts = counts[currentDomain];
        if (domainCounts && domainCounts.date === today) {
          const total = (domainCounts.overloaded || 0) + (domainCounts.fatigued || 0);
          if (total >= POPUP_REPEAT_COUNT) {
            type = 'app_repeat';
            data = { domain: currentDomain, count: total };
            fired = true;
          }
        }
      }

      if (fired) {
        setShouldShowPopup(true);
        setTriggerType(type);
        setTriggerDomain(currentDomain);
        setTriggerData(data);
        storage.set('last_popup_time', now);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [score, currentDomain, shouldShowPopup]);

  const dismissPopup = useCallback((action = 'dismissed') => {
    // Log to notification history
    const history = storage.get('notification_history') || [];
    history.unshift({
      timestamp: Date.now(),
      triggerType,
      domain: triggerDomain,
      action,
    });
    storage.set('notification_history', history.slice(0, 100)); // Keep last 100

    setShouldShowPopup(false);
    setTriggerType(null);
    setTriggerDomain(null);
    setTriggerData({});
  }, [triggerType, triggerDomain]);

  // Force trigger for testing
  const forceTrigger = useCallback((type = 'sustained_drain', domain = 'test.com') => {
    const now = Date.now();
    storage.set('last_popup_time', now);
    setShouldShowPopup(true);
    setTriggerType(type);
    setTriggerDomain(domain);
    setTriggerData({ domain, minutes: 30, score: 72, peakScore: 85, currentScore: 45 });
  }, []);

  return {
    shouldShowPopup,
    triggerType,
    triggerDomain,
    triggerData,
    dismissPopup,
    forceTrigger,
  };
}
