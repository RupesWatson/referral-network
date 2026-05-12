import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { loadData, saveData, clearData } from '../utils/storage';
import { SAMPLE_NODES, SAMPLE_EDGES } from '../data/sampleData';
import { createSimNode, generateId } from '../utils/simulation';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [linkMode, setLinkModeState] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState(null);
  const saveTimer = useRef(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const data = await loadData();
      if (data && data.nodes && data.nodes.length > 0) {
        // Restore physics props for sim nodes
        setNodes(data.nodes.map(n => ({ vx: 0, vy: 0, fx: 0, fy: 0, fixed: false, ...n })));
        setEdges(data.edges || []);
      } else {
        // First run — seed with sample data
        setNodes(SAMPLE_NODES.map(createSimNode));
        setEdges(SAMPLE_EDGES);
      }
      setLoaded(true);
    })();
  }, []);

  // ── Debounced auto-save ────────────────────────────────────────────────────
  const scheduleSave = useCallback((nextNodes, nextEdges) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      // Strip physics fields before saving
      const clean = nextNodes.map(({ vx, vy, fx, fy, ...rest }) => rest);
      saveData(clean, nextEdges);
    }, 500);
  }, []);

  // ── Node CRUD ──────────────────────────────────────────────────────────────
  const addNode = useCallback((data) => {
    const node = createSimNode({ id: generateId(), ...data });
    setNodes(prev => {
      const next = [...prev, node];
      scheduleSave(next, edges);
      return next;
    });
    return node;
  }, [edges, scheduleSave]);

  const updateNode = useCallback((id, data) => {
    setNodes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, ...data } : n);
      scheduleSave(next, edges);
      return next;
    });
  }, [edges, scheduleSave]);

  const deleteNode = useCallback((id) => {
    setNodes(prev => {
      const next = prev.filter(n => n.id !== id);
      setEdges(prevEdges => {
        const nextEdges = prevEdges.filter(e => e.sourceId !== id && e.targetId !== id);
        scheduleSave(next, nextEdges);
        return nextEdges;
      });
      return next;
    });
  }, [scheduleSave]);

  // ── Edge CRUD ──────────────────────────────────────────────────────────────
  const addEdge = useCallback((data) => {
    const edge = { id: generateId(), ...data };
    setEdges(prev => {
      const next = [...prev, edge];
      scheduleSave(nodes, next);
      return next;
    });
    return edge;
  }, [nodes, scheduleSave]);

  const updateEdge = useCallback((id, data) => {
    setEdges(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...data } : e);
      scheduleSave(nodes, next);
      return next;
    });
  }, [nodes, scheduleSave]);

  const deleteEdge = useCallback((id) => {
    setEdges(prev => {
      const next = prev.filter(e => e.id !== id);
      scheduleSave(nodes, next);
      return next;
    });
  }, [nodes, scheduleSave]);

  // ── Clear all ──────────────────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    await clearData();
    setNodes([]);
    setEdges([]);
  }, []);

  // ── Link mode ──────────────────────────────────────────────────────────────
  const startLinkMode = useCallback((sourceId) => {
    setLinkModeState(true);
    setLinkSourceId(sourceId);
  }, []);

  const cancelLinkMode = useCallback(() => {
    setLinkModeState(false);
    setLinkSourceId(null);
  }, []);

  // ── Node position update (from graph drag) ─────────────────────────────────
  const updateNodePosition = useCallback((id, x, y, fixed = false) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y, fixed } : n));
  }, []);

  // ── Derived helpers ────────────────────────────────────────────────────────
  const getNode = useCallback((id) => nodes.find(n => n.id === id), [nodes]);
  const getEdge = useCallback((id) => edges.find(e => e.id === id), [edges]);
  const getNodeEdges = useCallback((id) =>
    edges.filter(e => e.sourceId === id || e.targetId === id), [edges]);

  const value = {
    nodes, edges, loaded,
    addNode, updateNode, deleteNode,
    addEdge, updateEdge, deleteEdge,
    clearAll,
    linkMode, linkSourceId, startLinkMode, cancelLinkMode,
    updateNodePosition,
    getNode, getEdge, getNodeEdges,
    setNodes, setEdges,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
