import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import NetworkGraph from '../components/NetworkGraph';
import { useApp }   from '../context/AppContext';
import { TYPE_COLORS, TYPE_LABELS } from '../utils/colors';
import { applyColumnLayout } from '../utils/simulation';

const FILTER_PILLS = [
  { key: 'all',          label: 'All' },
  { key: 'client',       label: 'Clients' },
  { key: 'prospect',     label: 'Prospects' },
  { key: 'referrer',     label: 'Referrers' },
  { key: 'adviser',      label: 'Advisers' },
  { key: 'jpmorgan',     label: 'JP Morgan' },
  { key: 'organisation', label: 'Orgs' },
];

const LAYOUTS = [
  { key: 'free',              label: 'Free' },
  { key: 'by-type',           label: 'By Type' },
  { key: 'clients-prospects', label: 'Clients → Prospects' },
  { key: 'referrers-hub',     label: 'Referrers Hub' },
  { key: 'jpmorgan-view',     label: 'JP Morgan View' },
];

export default function NetworkScreen() {
  const navigation = useNavigation();
  const {
    nodes, edges, setNodes,
    linkMode, linkSourceId, startLinkMode, cancelLinkMode,
    addEdge, deleteNode, deleteEdge,
  } = useApp();

  const [filter,      setFilter]      = useState('all');
  const [selectedNodeId, setSelNodeId] = useState(null);
  const [selectedEdgeId, setSelEdgeId] = useState(null);
  const [showLayouts, setShowLayouts] = useState(false);

  const graphRef = useRef(null);

  // ── Node press ─────────────────────────────────────────────────────────────
  const handleNodePress = useCallback((nodeId) => {
    setSelNodeId(nodeId);
    setSelEdgeId(null);
    navigation.navigate('Detail', { nodeId });
  }, [navigation]);

  // ── Edge press ─────────────────────────────────────────────────────────────
  const handleEdgePress = useCallback((edgeId) => {
    setSelEdgeId(edgeId);
    setSelNodeId(null);
    navigation.navigate('Detail', { edgeId });
  }, [navigation]);

  // ── Link mode target ──────────────────────────────────────────────────────
  const handleLinkTarget = useCallback((targetId) => {
    cancelLinkMode();
    navigation.navigate('AddConnection', { sourceId: linkSourceId, targetId });
  }, [cancelLinkMode, linkSourceId, navigation]);

  // ── Layout preset ──────────────────────────────────────────────────────────
  const applyLayout = useCallback((layoutKey) => {
    setShowLayouts(false);
    if (layoutKey === 'free') return;
    setNodes(prev => {
      const copy = prev.map(n => ({ ...n }));
      applyColumnLayout(copy, layoutKey);
      return copy;
    });
  }, [setNodes]);

  return (
    <SafeAreaView style={styles.root}>

      {/* ── Toolbar ── */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
          {FILTER_PILLS.map(p => {
            const active = filter === p.key;
            const col    = p.key === 'all' ? '#185fa5' : TYPE_COLORS[p.key]?.fill || '#185fa5';
            return (
              <TouchableOpacity
                key={p.key}
                style={[styles.pill, active && { backgroundColor: col, borderColor: col }]}
                onPress={() => setFilter(p.key)}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Graph canvas ── */}
      <View style={styles.graphWrap}>
        <NetworkGraph
          nodes={nodes}
          edges={edges}
          filter={filter}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          linkMode={linkMode}
          linkSourceId={linkSourceId}
          onNodePress={handleNodePress}
          onEdgePress={handleEdgePress}
          onLinkTarget={handleLinkTarget}
          style={styles.graph}
        />

        {/* Link mode banner */}
        {linkMode && (
          <View style={styles.linkBanner}>
            <Text style={styles.linkBannerText}>
              Tap the second node to connect   ·
            </Text>
            <TouchableOpacity onPress={cancelLinkMode}>
              <Text style={styles.linkBannerCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Floating controls */}
        <View style={styles.floatingLeft}>
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEditPerson', {})}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.floatingRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowLayouts(v => !v)}>
            <Text style={styles.iconBtnText}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {
            // Fit handled by graph itself through state change
            setNodes(prev => [...prev]); // triggers rerender → fit runs on next render
          }}>
            <Text style={styles.iconBtnText}>⊡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {
            if (linkMode) { cancelLinkMode(); return; }
            Alert.alert('Link Nodes', 'Press on a node in the graph to start linking.',
              [{ text: 'OK' }]);
          }}>
            <Text style={[styles.iconBtnText, linkMode && { color: '#f59e0b' }]}>🔗</Text>
          </TouchableOpacity>
        </View>

        {/* Layout picker */}
        {showLayouts && (
          <View style={styles.layoutPicker}>
            {LAYOUTS.map(l => (
              <TouchableOpacity key={l.key} style={styles.layoutItem} onPress={() => applyLayout(l.key)}>
                <Text style={styles.layoutItemText}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>LEGEND</Text>
          {[
            { color: '#185fa5', label: 'Client' },
            { color: '#0f6e56', label: 'Prospect' },
            { color: '#993c1d', label: 'Referrer' },
            { color: '#534ab7', label: 'Adviser' },
            { color: '#003087', label: 'JP Morgan' },
            { color: '#6b7280', label: 'Org' },
          ].map(({ color, label }) => (
            <View key={label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#fff' },
  toolbar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 8 },
  pills:   { paddingHorizontal: 12 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb',
    marginRight: 6, backgroundColor: '#f3f4f6',
  },
  pillText:       { fontSize: 11, fontWeight: '600', color: '#555' },
  pillTextActive: { color: '#fff' },
  graphWrap: { flex: 1, position: 'relative' },
  graph:     { flex: 1 },

  linkBanner: {
    position: 'absolute', top: 10, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f59e0b', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  linkBannerText:   { color: '#fff', fontSize: 12, fontWeight: '600' },
  linkBannerCancel: { color: '#fff', fontSize: 12, fontWeight: '800', textDecorationLine: 'underline' },

  floatingLeft: { position: 'absolute', bottom: 20, left: 16 },
  fab: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#185fa5', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 30 },

  floatingRight: { position: 'absolute', bottom: 20, right: 16, gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  iconBtnText: { fontSize: 16 },

  layoutPicker: {
    position: 'absolute', bottom: 68, right: 16,
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
    minWidth: 180, overflow: 'hidden',
  },
  layoutItem:     { paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  layoutItemText: { fontSize: 13, color: '#333' },

  legend: {
    position: 'absolute', bottom: 16, left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb',
    padding: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  legendTitle: { fontSize: 9, fontWeight: '700', color: '#aaa', letterSpacing: 0.8, marginBottom: 6 },
  legendRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendDot:   { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendLabel: { fontSize: 10, color: '#555' },
});
