import React, { useRef, useEffect, useReducer, useCallback } from 'react';
import { View, PanResponder, Dimensions, StyleSheet } from 'react-native';
import Svg, { G, Circle, Rect, Line, Text as SvgText, Defs, Marker, Polygon } from 'react-native-svg';

import { stepSimulation, hasSettled, getInitials } from '../utils/simulation';
import { TYPE_COLORS, EDGE_STYLES } from '../utils/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SIM_FPS = 30;
const TAP_THRESHOLD_PX = 8;
const TAP_THRESHOLD_MS = 300;
const NODE_RADIUS = 22;
const ORG_HALF   = 20;

export default function NetworkGraph({
  nodes,           // from context
  edges,           // from context
  filter,          // 'all' | type string
  selectedNodeId,
  selectedEdgeId,
  linkMode,
  linkSourceId,
  onNodePress,
  onEdgePress,
  onLinkTarget,
  onNodeDragEnd,
  style,
}) {
  // ── Mutable sim state lives in refs (never triggers re-render on its own) ──
  const simRef = useRef({
    nodes:    [],
    edges:    [],
    tickCount: 0,
    running:  true,
  });
  const viewRef = useRef({ panX: 0, panY: 0, zoom: 1.0 });

  // forceRender increments to trigger React re-render
  const [, forceRender] = useReducer(x => x + 1, 0);

  const intervalRef = useRef(null);
  const layoutRef   = useRef({ w: SCREEN_W, h: SCREEN_H - 180 });

  // ── Sync incoming nodes/edges into sim (preserve positions) ──────────────
  useEffect(() => {
    const prevMap = new Map(simRef.current.nodes.map(n => [n.id, n]));
    simRef.current.nodes = nodes.map(n => {
      const prev = prevMap.get(n.id);
      if (prev) return { ...n, x: prev.x, y: prev.y, vx: prev.vx, vy: prev.vy, fx: prev.fx, fy: prev.fy, fixed: prev.fixed };
      return { ...n };
    });
    simRef.current.edges    = edges;
    simRef.current.tickCount = 0;
    simRef.current.running   = true;
  }, [nodes, edges]);

  // ── Simulation interval ───────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const sim = simRef.current;
      if (!sim.running) return;
      const visible = sim.nodes.filter(n => filter === 'all' || n.type === filter);
      const maxVel  = stepSimulation(visible, sim.edges);
      sim.tickCount++;
      if (hasSettled(maxVel, sim.tickCount)) sim.running = false;
      forceRender();
    }, 1000 / SIM_FPS);
    return () => clearInterval(intervalRef.current);
  }, [filter]);

  // ── Hit testing ───────────────────────────────────────────────────────────
  const graphCoords = useCallback((px, py) => {
    const { w, h } = layoutRef.current;
    const { panX, panY, zoom } = viewRef.current;
    return {
      gx: (px - w / 2 - panX) / zoom,
      gy: (py - h / 2 - panY) / zoom,
    };
  }, []);

  const hitTestNode = useCallback((gx, gy) => {
    const ns = simRef.current.nodes.filter(n => filter === 'all' || n.type === filter);
    for (let i = ns.length - 1; i >= 0; i--) {
      const n = ns[i];
      const dx = gx - n.x, dy = gy - n.y;
      const r  = n.type === 'organisation' ? ORG_HALF + 4 : NODE_RADIUS + 4;
      if (dx * dx + dy * dy < r * r) return n.id;
    }
    return null;
  }, [filter]);

  const hitTestEdge = useCallback((gx, gy) => {
    const nodeMap = new Map(simRef.current.nodes.map(n => [n.id, n]));
    for (const e of simRef.current.edges) {
      const s = nodeMap.get(e.sourceId), t = nodeMap.get(e.targetId);
      if (!s || !t) continue;
      const dx = t.x - s.x, dy = t.y - s.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const t2  = ((gx - s.x) * dx + (gy - s.y) * dy) / (len * len);
      const tc  = Math.max(0, Math.min(1, t2));
      const cx  = s.x + tc * dx - gx, cy = s.y + tc * dy - gy;
      if (cx * cx + cy * cy < 100) return e.id;
    }
    return null;
  }, []);

  // ── PanResponder ──────────────────────────────────────────────────────────
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0, draggingNodeId: null, panning: false });

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,

    onPanResponderGrant: (evt) => {
      const { locationX: px, locationY: py } = evt.nativeEvent;
      const { gx, gy } = graphCoords(px, py);
      const nodeId = hitTestNode(gx, gy);
      touchRef.current = {
        startX: px, startY: py,
        startTime: Date.now(),
        draggingNodeId: nodeId,
        panning: !nodeId,
        lastPanX: viewRef.current.panX,
        lastPanY: viewRef.current.panY,
      };
      if (nodeId) {
        const n = simRef.current.nodes.find(n => n.id === nodeId);
        if (n) n.fixed = true;
      }
    },

    onPanResponderMove: (evt, gs) => {
      const touch = touchRef.current;
      const dx = gs.dx, dy = gs.dy;

      if (touch.draggingNodeId) {
        const { gx, gy } = graphCoords(touch.startX + dx, touch.startY + dy);
        const n = simRef.current.nodes.find(n => n.id === touch.draggingNodeId);
        if (n) { n.x = gx; n.y = gy; n.vx = 0; n.vy = 0; }
        simRef.current.running = true;
        simRef.current.tickCount = 0;
        forceRender();
      } else if (touch.panning) {
        viewRef.current.panX = touch.lastPanX + dx;
        viewRef.current.panY = touch.lastPanY + dy;
        forceRender();
      }
    },

    onPanResponderRelease: (evt, gs) => {
      const touch = touchRef.current;
      const totalMove = Math.sqrt(gs.dx * gs.dx + gs.dy * gs.dy);
      const elapsed   = Date.now() - touch.startTime;
      const isTap     = totalMove < TAP_THRESHOLD_PX && elapsed < TAP_THRESHOLD_MS;

      if (touch.draggingNodeId) {
        const n = simRef.current.nodes.find(n => n.id === touch.draggingNodeId);
        if (n) {
          n.fixed = isTap ? false : true;
          if (!isTap && onNodeDragEnd) onNodeDragEnd(n.id, n.x, n.y);
        }
        if (isTap) {
          const { locationX: px, locationY: py } = evt.nativeEvent;
          const { gx, gy } = graphCoords(px, py);
          const nodeId = hitTestNode(gx, gy);
          if (nodeId) {
            if (linkMode && nodeId !== linkSourceId) {
              onLinkTarget && onLinkTarget(nodeId);
            } else {
              onNodePress && onNodePress(nodeId);
            }
          }
        }
      } else if (isTap) {
        const { locationX: px, locationY: py } = evt.nativeEvent;
        const { gx, gy } = graphCoords(px, py);
        const edgeId = hitTestEdge(gx, gy);
        if (edgeId) onEdgePress && onEdgePress(edgeId);
      }

      touchRef.current.draggingNodeId = null;
    },
  })).current;

  // ── Zoom controls ─────────────────────────────────────────────────────────
  const zoom = useCallback((factor) => {
    viewRef.current.zoom = Math.max(0.3, Math.min(3.0, viewRef.current.zoom * factor));
    forceRender();
  }, []);

  const fitToScreen = useCallback(() => {
    const ns = simRef.current.nodes.filter(n => n.x !== undefined);
    if (ns.length === 0) return;
    const xs = ns.map(n => n.x), ys = ns.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const { w, h } = layoutRef.current;
    const pad   = 60;
    const scaleX = (w - pad * 2) / (maxX - minX + 1);
    const scaleY = (h - pad * 2) / (maxY - minY + 1);
    const scale  = Math.min(scaleX, scaleY, 1.5);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    viewRef.current.zoom = scale;
    viewRef.current.panX = -cx * scale;
    viewRef.current.panY = -cy * scale;
    forceRender();
  }, []);

  // Expose zoom/fit to parent via ref
  const selfRef = useRef({ zoom, fitToScreen });
  selfRef.current = { zoom, fitToScreen };

  // ── Render ────────────────────────────────────────────────────────────────
  const { panX, panY, zoom: zoomLevel } = viewRef.current;
  const sim  = simRef.current;
  const nodeMap = new Map(sim.nodes.map(n => [n.id, n]));

  const visibleNodes = sim.nodes.filter(n => filter === 'all' || n.type === filter);
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = sim.edges.filter(e =>
    visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId));

  return (
    <View
      style={[styles.container, style]}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        layoutRef.current = { w: width, h: height };
      }}
      {...panResponder.panHandlers}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Marker id="arrow" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <Polygon points="0 0, 10 3.5, 0 7" fill="#185FA5" />
          </Marker>
        </Defs>

        <G transform={`translate(${layoutRef.current.w / 2 + panX}, ${layoutRef.current.h / 2 + panY}) scale(${zoomLevel})`}>

          {/* ── Edges ── */}
          {visibleEdges.map(edge => {
            const s = nodeMap.get(edge.sourceId);
            const t = nodeMap.get(edge.targetId);
            if (!s || !t) return null;
            const style  = EDGE_STYLES[edge.relationshipType] || EDGE_STYLES.knows;
            const isSel  = edge.id === selectedEdgeId;
            const w      = isSel ? style.width + 2 : Math.max(1.5, style.width * edge.strength * 0.6);

            return (
              <Line
                key={edge.id}
                x1={s.x} y1={s.y}
                x2={t.x} y2={t.y}
                stroke={isSel ? '#f59e0b' : style.stroke}
                strokeWidth={w}
                strokeDasharray={style.dashArray || undefined}
                markerEnd={style.arrow && !isSel ? 'url(#arrow)' : undefined}
                opacity={0.85}
              />
            );
          })}

          {/* ── Nodes ── */}
          {visibleNodes.map(node => {
            const colors = TYPE_COLORS[node.type] || TYPE_COLORS.client;
            const isSel  = node.id === selectedNodeId;
            const isLinkSrc = linkMode && node.id === linkSourceId;
            const label = getInitials(node.name);

            if (node.type === 'organisation') {
              return (
                <G key={node.id} x={node.x} y={node.y}>
                  <Rect
                    x={-ORG_HALF} y={-ORG_HALF}
                    width={ORG_HALF * 2} height={ORG_HALF * 2}
                    rx={5} ry={5}
                    fill={colors.fill}
                    stroke={isSel ? '#f59e0b' : isLinkSrc ? '#f59e0b' : '#fff'}
                    strokeWidth={isSel || isLinkSrc ? 3 : 2}
                    opacity={0.92}
                  />
                  <SvgText
                    x={0} y={0}
                    textAnchor="middle" dominantBaseline="central"
                    fill="#fff" fontSize={10} fontWeight="700"
                  >{label}</SvgText>
                  <SvgText
                    x={0} y={ORG_HALF + 12}
                    textAnchor="middle"
                    fill="#374151" fontSize={9} fontWeight="600"
                  >{node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name}</SvgText>
                </G>
              );
            }

            return (
              <G key={node.id} x={node.x} y={node.y}>
                {/* Outer ring for selected */}
                {(isSel || isLinkSrc) && (
                  <Circle r={NODE_RADIUS + 6} fill="none" stroke="#f59e0b" strokeWidth={2.5} opacity={0.8} />
                )}
                <Circle
                  r={NODE_RADIUS}
                  fill={colors.fill}
                  stroke="#fff"
                  strokeWidth={2}
                  opacity={0.92}
                />
                <SvgText
                  x={0} y={0}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#fff" fontSize={11} fontWeight="700"
                >{label}</SvgText>
                <SvgText
                  x={0} y={NODE_RADIUS + 11}
                  textAnchor="middle"
                  fill="#374151" fontSize={9} fontWeight="600"
                >{node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name}</SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
});
