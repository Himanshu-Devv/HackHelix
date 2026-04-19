// ============================================
// useSessionTracker — Domain session tracking + cost map
// ============================================
// Workflow: Session data written to cost map on domain switch

import { useState, useCallback, useRef } from 'react';
import storage from '../utils/storage';

export default function useSessionTracker(currentScore) {
  const [currentDomain, setCurrentDomain] = useState('');
  const sessionStart = useRef(null);
  const scoreAccumulator = useRef([]);

  const startSession = useCallback((domain) => {
    setCurrentDomain(domain);
    sessionStart.current = Date.now();
    scoreAccumulator.current = [];
  }, []);

  // Call this every second to accumulate scores
  const recordScore = useCallback((score) => {
    if (score !== null && score !== undefined && sessionStart.current) {
      scoreAccumulator.current.push(score);
    }
  }, []);

  const endSession = useCallback(() => {
    if (!currentDomain || !sessionStart.current) return null;

    const durationSeconds = Math.floor((Date.now() - sessionStart.current) / 1000);
    
    // Discard sessions under 60 seconds
    if (durationSeconds < 60) {
      sessionStart.current = null;
      scoreAccumulator.current = [];
      return null;
    }

    const scores = scoreAccumulator.current;
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const session = {
      domain: currentDomain,
      avgScore,
      durationSeconds,
      timestamp: Date.now(),
    };

    // Save to localStorage
    const sessions = storage.get('cost_map_sessions') || [];
    sessions.push(session);
    storage.set('cost_map_sessions', sessions);

    // Reset
    sessionStart.current = null;
    scoreAccumulator.current = [];

    return session;
  }, [currentDomain]);

  // Switch app: end current session + start new one
  const switchApp = useCallback((newDomain) => {
    const ended = endSession();
    startSession(newDomain);
    return ended;
  }, [endSession, startSession]);

  // Get 7-day rolling average per domain
  const getCostMap = useCallback(() => {
    const sessions = storage.get('cost_map_sessions') || [];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = sessions.filter(s => s.timestamp > sevenDaysAgo);

    const domainMap = {};
    for (const s of recent) {
      if (!domainMap[s.domain]) {
        domainMap[s.domain] = { totalScore: 0, count: 0, totalDuration: 0 };
      }
      domainMap[s.domain].totalScore += s.avgScore;
      domainMap[s.domain].count += 1;
      domainMap[s.domain].totalDuration += s.durationSeconds;
    }

    return Object.entries(domainMap).map(([domain, data]) => ({
      domain,
      avgScore: Math.round(data.totalScore / data.count),
      sessionCount: data.count,
      totalDuration: data.totalDuration,
    })).sort((a, b) => b.avgScore - a.avgScore);
  }, []);

  return {
    currentDomain,
    startSession,
    endSession,
    switchApp,
    recordScore,
    getCostMap,
  };
}
