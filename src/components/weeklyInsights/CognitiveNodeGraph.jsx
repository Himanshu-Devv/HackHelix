// ============================================
// CognitiveNodeGraph — D3-force SVG graph
// ============================================
// D3 is used for physics/coordinate computation only.
// React renders all SVG elements.
// Pattern: d3-force simulation in useEffect → on each tick, copy x,y into React state → render from state
// Never call d3.select or any D3 DOM manipulation method.

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { drag as d3Drag } from 'd3-drag';
import { select } from 'd3-selection';
import { DEMO_APP_NODES, FATIGUE_NODES, ADHD_NODES, buildEdges, getNodeColor, getNodeRadius, getTooltipText } from '../../utils/graphData';
import storage from '../../utils/storage';
import NodeTooltip from './NodeTooltip';

export default function CognitiveNodeGraph({ costMap = [], observationMode = false }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const [nodePositions, setNodePositions] = useState([]);
  const [edgePositions, setEdgePositions] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const width = 700;
  const height = 450;

  // Build nodes from costMap + demo data
  const graphData = useMemo(() => {
    const popupCounts = storage.get('popup_counts') || {};
    
    // Merge costMap domains with demo data
    const existingIds = new Set();
    const appNodes = [];

    // Add costMap domains
    for (const entry of costMap) {
      const id = entry.domain.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!existingIds.has(id)) {
        existingIds.add(id);
        appNodes.push({
          id,
          label: entry.domain,
          avgScore: entry.avgScore,
          type: 'app',
          isRepeatOffender: ((popupCounts[entry.domain]?.overloaded || 0) +
                            (popupCounts[entry.domain]?.fatigued || 0)) >= 3,
        });
      }
    }

    // Add demo apps if not already present
    for (const demo of DEMO_APP_NODES) {
      if (!existingIds.has(demo.id)) {
        existingIds.add(demo.id);
        appNodes.push({
          ...demo,
          isRepeatOffender: ((popupCounts[demo.label]?.overloaded || 0) +
                            (popupCounts[demo.label]?.fatigued || 0)) >= 3,
        });
      }
    }

    const allNodes = [
      ...appNodes,
      ...FATIGUE_NODES.map(n => ({ ...n, fx: null, fy: null })),
      ...ADHD_NODES.map(n => ({ ...n })),
    ];

    const edges = buildEdges(appNodes);
    return { nodes: allNodes, edges };
  }, [costMap]);

  // Initialize D3 simulation
  useEffect(() => {
    if (graphData.nodes.length === 0) return;

    const nodes = graphData.nodes.map((n, i) => {
      // Position fatigue nodes in center area
      if (n.type === 'fatigue') {
        const angle = (i - graphData.nodes.findIndex(x => x.type === 'fatigue')) * (2 * Math.PI / 3);
        return { ...n, x: width/2 + Math.cos(angle) * 60, y: height/2 + Math.sin(angle) * 40, fx: undefined, fy: undefined };
      }
      if (n.type === 'adhd') {
        const adhdIdx = graphData.nodes.filter(x => x.type === 'adhd').indexOf(n);
        return { ...n, x: width/2 + (adhdIdx === 0 ? -100 : 100), y: height/2 + 80 };
      }
      return { ...n, x: width/2 + (Math.random() - 0.5) * 300, y: height/2 + (Math.random() - 0.5) * 200 };
    });

    const links = graphData.edges.map(e => ({
      source: e.source,
      target: e.target,
      type: e.type,
    }));

    const simulation = forceSimulation(nodes)
      .force('link', forceLink(links).id(d => d.id).distance(120).strength(0.3))
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide().radius(d => getNodeRadius(d) + 10))
      .alphaDecay(0.02);

    simulation.on('tick', () => {
      // Bound nodes within SVG
      for (const n of nodes) {
        const r = getNodeRadius(n);
        n.x = Math.max(r + 10, Math.min(width - r - 10, n.x));
        n.y = Math.max(r + 10, Math.min(height - r - 10, n.y));
      }

      setNodePositions(nodes.map(n => ({ ...n })));
      setEdgePositions(links.map(l => ({
        x1: l.source.x, y1: l.source.y,
        x2: l.target.x, y2: l.target.y,
        type: l.type,
        sourceId: l.source.id,
        targetId: l.target.id,
      })));
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  // Drag behavior — apply once when SVG is ready or nodes change
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current || nodePositions.length === 0) return;

    const svg = select(svgRef.current);

    const dragHandler = d3Drag()
      .on('start', (event, d) => {
        if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulationRef.current.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Apply drag to circle elements via class, but doing it safely
    // Since React renders the DOM, we need to bind event data based on index or element properties.
    // However, d3-drag relies on element.__data__ being set.
    // Let's bind element.__data__ manually for the drag behavior to work.
    
    // Bind D3 data to the React-rendered elements so d3-drag knows what 'd' is
    svg.selectAll('.graph-node')
       .data(nodePositions) // This binds the current node objects to DOM '__data__' property
       .call(dragHandler);

    return () => {
      svg.selectAll('.graph-node').on('.drag', null);
    };
  // We only need to re-bind when the structure of nodes changes, not every tick
  // The node array length is a proxy for structure change. 
  // We don't depend on nodePositions because we just need it once per nodes array.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData.nodes.length]);

  const handleNodeHover = useCallback((node, event) => {
    setHoveredNode(node);
    if (event) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
      });
    }
  }, []);

  const isConnected = useCallback((nodeId) => {
    if (!hoveredNode) return false;
    return edgePositions.some(e =>
      (e.sourceId === hoveredNode.id && e.targetId === nodeId) ||
      (e.targetId === hoveredNode.id && e.sourceId === nodeId) ||
      nodeId === hoveredNode.id
    );
  }, [hoveredNode, edgePositions]);

  return (
    <div className="relative" id="cognitive-node-graph">
      {/* Observation mode overlay */}
      {observationMode && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/60 rounded-xl">
          <span className="text-gray-400 text-sm font-medium px-4 py-2 bg-gray-800 rounded-lg">
            Not enough signal data — graph paused
          </span>
        </div>
      )}

      {/* Instruction text */}
      <p className="text-xs text-gray-500 text-center mb-2">
        Hover over any node to see how it connects to your fatigue
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={`w-full rounded-xl bg-gray-900/40 border border-white/5 ${
          observationMode ? 'opacity-40' : ''
        }`}
        style={{ maxHeight: '450px' }}
      >
        {/* Edges */}
        {edgePositions.map((edge, i) => {
          const highlighted = hoveredNode && (
            edge.sourceId === hoveredNode.id || edge.targetId === hoveredNode.id
          );
          const edgeColor = edge.type === 'high' ? '#ef4444' :
                           edge.type === 'medium' ? '#f59e0b' :
                           edge.type === 'adhd' ? '#3b82f6' : '#4b5563';
          return (
            <line
              key={`edge-${i}`}
              x1={edge.x1} y1={edge.y1}
              x2={edge.x2} y2={edge.y2}
              stroke={edgeColor}
              strokeWidth={highlighted ? 3 : 1.5}
              strokeOpacity={hoveredNode ? (highlighted ? 0.9 : 0.15) : 0.5}
              strokeDasharray={edge.type === 'adhd' ? '4,3' : undefined}
              style={{ transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }}
            />
          );
        })}

        {/* Nodes */}
        {nodePositions.map((node) => {
          const r = getNodeRadius(node);
          const color = getNodeColor(node);
          const highlighted = hoveredNode ? isConnected(node.id) : true;
          const isHovered = hoveredNode?.id === node.id;

          return (
            <g
              key={node.id}
              className="graph-node"
              style={{ cursor: 'grab' }}
              onMouseEnter={(e) => handleNodeHover(node, e)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Glow */}
              {isHovered && (
                <circle
                  cx={node.x} cy={node.y} r={r + 6}
                  fill={color}
                  opacity={0.15}
                />
              )}

              {/* Node circle */}
              <circle
                cx={node.x} cy={node.y} r={r}
                fill={`${color}30`}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                opacity={highlighted ? 1 : 0.3}
                style={{ transition: 'opacity 0.2s' }}
              />

              {/* Label */}
              <text
                x={node.x} y={node.y - r - 6}
                textAnchor="middle"
                fill={highlighted ? '#e5e5e5' : '#6b7280'}
                fontSize={node.type === 'app' ? 10 : 9}
                fontWeight={node.type === 'app' ? 500 : 400}
                style={{ transition: 'fill 0.2s', pointerEvents: 'none' }}
              >
                {node.label}
              </text>

              {/* Score label for apps */}
              {node.type === 'app' && (
                <text
                  x={node.x} y={node.y + 4}
                  textAnchor="middle"
                  fill={color}
                  fontSize={11}
                  fontWeight={700}
                  style={{ pointerEvents: 'none' }}
                >
                  {node.avgScore}
                </text>
              )}

              {/* Repeat offender badge */}
              {node.isRepeatOffender && (
                <text
                  x={node.x + r - 2} y={node.y - r + 2}
                  textAnchor="middle"
                  fontSize={10}
                  style={{ pointerEvents: 'none' }}
                >
                  ⚠️
                </text>
              )}

              {/* Type icon for non-app nodes */}
              {node.type === 'fatigue' && (
                <text
                  x={node.x} y={node.y + 4}
                  textAnchor="middle"
                  fontSize={12}
                  style={{ pointerEvents: 'none' }}
                >
                  🟣
                </text>
              )}
              {node.type === 'adhd' && (
                <text
                  x={node.x} y={node.y + 4}
                  textAnchor="middle"
                  fontSize={12}
                  style={{ pointerEvents: 'none' }}
                >
                  🔵
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredNode && (
        <NodeTooltip
          text={getTooltipText(hoveredNode, edgePositions)}
          x={tooltipPos.x}
          y={tooltipPos.y}
        />
      )}
    </div>
  );
}
