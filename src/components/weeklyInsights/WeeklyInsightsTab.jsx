// WeeklyInsightsTab — Tab 2 container
import React, { useState, useEffect, useRef } from 'react';
import { useFatigue } from '../../context/FatigueContext';
import CognitiveNodeGraph from './CognitiveNodeGraph';
import GraphLegend from './GraphLegend';
import TopDrainingApps from './TopDrainingApps';
import { DEMO_APP_NODES } from '../../utils/graphData';
import { MIN_SIGNALS_REQUIRED } from '../../utils/constants';

export default function WeeklyInsightsTab() {
  const { sessionTracker, activeSignalCount, score } = useFatigue();

  // Compute costMap ONCE on mount — not every render
  const [costMap, setCostMap] = useState(() => {
    const map = sessionTracker.getCostMap();
    if (map.length === 0) {
      return DEMO_APP_NODES.map(n => ({
        domain: n.label,
        avgScore: n.avgScore,
        sessionCount: 5,
        totalDuration: 3600,
      }));
    }
    return map;
  });

  // Only refresh costMap when the tab first mounts — not on every render
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const map = sessionTracker.getCostMap();
    if (map.length > 0) {
      setCostMap(map);
    }
  }, []);

  const observationMode = score === null || activeSignalCount < MIN_SIGNALS_REQUIRED;

  return (
    <div className="space-y-4 max-w-3xl mx-auto" id="weekly-insights-tab">
      <div className="glass-card rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">
          📊 Cognitive Cost Map — Weekly Insights
        </h2>
        <GraphLegend />
        <CognitiveNodeGraph costMap={costMap} observationMode={observationMode} />
      </div>

      <div className="glass-card rounded-xl p-4">
        <TopDrainingApps costMap={costMap} />
      </div>
    </div>
  );
}
