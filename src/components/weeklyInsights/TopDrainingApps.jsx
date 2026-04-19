// TopDrainingApps — Ranked list with color bars
import React from 'react';
import { getDrainLevel } from '../../utils/graphData';

const DRAIN_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#14b8a6',
};

export default function TopDrainingApps({ costMap }) {
  const top5 = costMap.slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        No app data yet — switch between apps to build your cost map
      </div>
    );
  }

  return (
    <div className="space-y-2" id="top-draining-apps">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        Top Draining Apps
      </h3>
      {top5.map((app, i) => {
        const drain = getDrainLevel(app.avgScore);
        const color = DRAIN_COLORS[drain];
        return (
          <div key={app.domain} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-4">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300 truncate">{app.domain}</span>
                <span className="text-xs font-mono font-bold" style={{ color }}>
                  {app.avgScore}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${app.avgScore}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
