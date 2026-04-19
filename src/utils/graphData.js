// ============================================
// Graph Data — Pre-seeded demo nodes + edge builder
// ============================================

// Initial demo app nodes (pre-seeded so graph looks populated on first load)
export const DEMO_APP_NODES = [
  { id: 'slack',      label: 'Slack',       avgScore: 82, type: 'app' },
  { id: 'email',      label: 'Email',       avgScore: 75, type: 'app' },
  { id: 'figma',      label: 'Figma',       avgScore: 58, type: 'app' },
  { id: 'notion',     label: 'Notion',      avgScore: 52, type: 'app' },
  { id: 'youtube',    label: 'YouTube',     avgScore: 28, type: 'app' },
  { id: 'googledocs', label: 'Google Docs', avgScore: 35, type: 'app' },
];

// Fixed fatigue state nodes (purple — always present, center-anchored)
export const FATIGUE_NODES = [
  { id: 'overload',      label: 'Overload',       type: 'fatigue' },
  { id: 'crash',         label: 'Crash',           type: 'fatigue' },
  { id: 'attentionfrag', label: 'Attention frag',  type: 'fatigue' },
];

// Fixed ADHD symptom nodes (blue — connect to fatigue nodes, not apps)
export const ADHD_NODES = [
  { id: 'paralysis',     label: 'Paralysis',       type: 'adhd' },
  { id: 'timeblindness', label: 'Time blindness',  type: 'adhd' },
];

/**
 * Get the drain level for an app based on its score
 */
export function getDrainLevel(avgScore) {
  if (avgScore > 65) return 'high';
  if (avgScore >= 40) return 'medium';
  return 'low';
}

/**
 * Get node color based on type and score
 */
export function getNodeColor(node) {
  if (node.type === 'fatigue') return '#a855f7';
  if (node.type === 'adhd')    return '#3b82f6';
  if (node.type === 'app') {
    const drain = getDrainLevel(node.avgScore);
    if (drain === 'high')   return '#f97316';
    if (drain === 'medium') return '#eab308';
    return '#14b8a6';
  }
  return '#6b7280';
}

/**
 * Get node radius based on type and score
 */
export function getNodeRadius(node) {
  if (node.type === 'fatigue') return 28;
  if (node.type === 'adhd')    return 24;
  if (node.type === 'app') {
    return Math.max(18, Math.min(40, node.avgScore * 0.4 + 10));
  }
  return 20;
}

/**
 * Get edge color based on source app's drain level
 */
export function getEdgeColor(sourceNode) {
  if (!sourceNode || sourceNode.type !== 'app') return '#4b5563';
  const drain = getDrainLevel(sourceNode.avgScore);
  if (drain === 'high')   return '#ef4444';
  if (drain === 'medium') return '#f59e0b';
  return '#6b7280';
}

/**
 * Build edges connecting apps to fatigue nodes based on score bands
 * Score >65  → connects to 'overload' and 'crash' nodes
 * Score 40–65 → connects to 'attentionfrag' node
 * Score <40  → no fatigue node connection
 * ADHD nodes connect to fatigue nodes, not directly to apps
 */
export function buildEdges(appNodes) {
  const edges = [];

  // App → Fatigue connections
  for (const app of appNodes) {
    if (app.type !== 'app') continue;
    
    if (app.avgScore > 65) {
      edges.push({ source: app.id, target: 'overload', type: 'high' });
      edges.push({ source: app.id, target: 'crash',    type: 'high' });
    } else if (app.avgScore >= 40) {
      edges.push({ source: app.id, target: 'attentionfrag', type: 'medium' });
    }
    // score < 40: no fatigue connection
  }

  // ADHD → Fatigue connections (always present)
  edges.push({ source: 'paralysis',     target: 'overload', type: 'adhd' });
  edges.push({ source: 'paralysis',     target: 'crash',    type: 'adhd' });
  edges.push({ source: 'timeblindness', target: 'attentionfrag', type: 'adhd' });
  edges.push({ source: 'timeblindness', target: 'crash',    type: 'adhd' });

  return edges;
}

/**
 * Build complete graph data from app sessions + fixed nodes
 */
export function buildGraphData(appNodes, popupCounts = {}) {
  const allApps = appNodes.map(app => ({
    ...app,
    isRepeatOffender: (popupCounts[app.label]?.overloaded || 0) + 
                      (popupCounts[app.label]?.fatigued || 0) >= 3,
  }));

  const nodes = [
    ...allApps,
    ...FATIGUE_NODES,
    ...ADHD_NODES,
  ];

  const edges = buildEdges(allApps);

  return { nodes, edges };
}

/**
 * Build tooltip text for a node
 */
export function getTooltipText(node, edges) {
  if (node.type === 'app') {
    const connected = edges
      .filter(e => e.source === node.id || (e.source?.id === node.id))
      .map(e => {
        const targetId = typeof e.target === 'string' ? e.target : e.target?.id;
        return targetId;
      });
    
    if (connected.length === 0) return `${node.label} (${node.avgScore}) — Low drain, no fatigue connections`;
    
    const fatigueNames = connected.map(id => {
      if (id === 'overload') return 'Overload';
      if (id === 'crash') return 'Crash';
      if (id === 'attentionfrag') return 'Attention frag';
      return id;
    });
    
    return `${node.label} → triggers ${fatigueNames.join(' → leads to ')}`;
  }
  
  if (node.type === 'fatigue') {
    return `${node.label} — Fatigue state triggered by high-drain apps`;
  }
  
  if (node.type === 'adhd') {
    return `${node.label} — ADHD symptom linked to fatigue states`;
  }
  
  return node.label;
}
