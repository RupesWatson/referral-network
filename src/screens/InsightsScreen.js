import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp }     from '../context/AppContext';
import TypeBadge      from '../components/TypeBadge';
import { TYPE_COLORS, TYPE_LABELS } from '../utils/colors';
import { getInitials } from '../utils/simulation';

function StatCard({ label, value, sub, color }) {
  return (
    <View style={[styles.statCard, color && { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

export default function InsightsScreen() {
  const navigation = useNavigation();
  const { nodes, edges, clearAll } = useApp();

  const insights = useMemo(() => {
    const prospects = nodes.filter(n => n.type === 'prospect');
    const referrers = nodes.filter(n => n.type === 'referrer');
    const clients   = nodes.filter(n => n.type === 'client');

    // Top referrer: referrer with most outgoing 'referred' edges
    const refCounts = {};
    for (const e of edges) {
      if (e.relationshipType === 'referred') {
        refCounts[e.sourceId] = (refCounts[e.sourceId] || 0) + 1;
      }
    }
    const topReferrerId = Object.entries(refCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topReferrer   = topReferrerId ? nodes.find(n => n.id === topReferrerId) : null;

    // Warmest prospect: highest engagementScore
    const warmest = [...prospects].sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))[0];

    // Isolated prospects: prospects with no edges
    const connectedIds = new Set(edges.flatMap(e => [e.sourceId, e.targetId]));
    const isolated = prospects.filter(n => !connectedIds.has(n.id));

    // Type breakdown
    const breakdown = {};
    for (const n of nodes) breakdown[n.type] = (breakdown[n.type] || 0) + 1;

    return { topReferrer, warmest, isolated, breakdown, refCounts };
  }, [nodes, edges]);

  const handleClear = () => {
    Alert.alert('Clear All Data', 'This will delete all nodes and connections. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAll },
    ]);
  };

  const typeOrder = ['client', 'prospect', 'referrer', 'adviser', 'jpmorgan', 'organisation'];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.heading}>Insights</Text>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={styles.bigStat}>
            <Text style={styles.bigStatNum}>{nodes.length}</Text>
            <Text style={styles.bigStatLabel}>Total People</Text>
          </View>
          <View style={styles.bigStat}>
            <Text style={styles.bigStatNum}>{edges.length}</Text>
            <Text style={styles.bigStatLabel}>Connections</Text>
          </View>
          <View style={styles.bigStat}>
            <Text style={styles.bigStatNum}>{nodes.filter(n => n.type === 'prospect').length}</Text>
            <Text style={styles.bigStatLabel}>Prospects</Text>
          </View>
        </View>

        {/* Key insights */}
        <Text style={styles.sectionTitle}>KEY METRICS</Text>
        <StatCard
          label="Top Referrer"
          value={insights.topReferrer?.name || 'None yet'}
          sub={insights.topReferrer ? `${Object.values(insights.refCounts).reduce((a,b)=>a+b,0)} referrals total` : undefined}
          color="#993c1d"
        />
        <StatCard
          label="Warmest Prospect"
          value={insights.warmest?.name || 'None yet'}
          sub={insights.warmest ? `${insights.warmest.organisation || ''}  · Engagement: ${'★'.repeat(insights.warmest.engagementScore || 0)}` : undefined}
          color="#0f6e56"
        />
        <StatCard
          label="Network Gaps"
          value={`${insights.isolated.length} isolated prospects`}
          sub={insights.isolated.length > 0 ? insights.isolated.map(n => n.name).join(', ') : 'All prospects are connected'}
          color={insights.isolated.length > 0 ? '#dc2626' : '#0f6e56'}
        />

        {/* Type breakdown */}
        <Text style={styles.sectionTitle}>BREAKDOWN BY TYPE</Text>
        {typeOrder.map(type => {
          const count = insights.breakdown[type] || 0;
          if (count === 0) return null;
          const color = TYPE_COLORS[type]?.fill || '#888';
          return (
            <View key={type} style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: color }]} />
              <Text style={styles.breakdownLabel}>{TYPE_LABELS[type]}</Text>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, {
                  width: `${Math.round((count / Math.max(nodes.length, 1)) * 100)}%`,
                  backgroundColor: color,
                }]} />
              </View>
              <Text style={styles.breakdownCount}>{count}</Text>
            </View>
          );
        })}

        {/* Actions */}
        <Text style={styles.sectionTitle}>ACTIONS</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddEditPerson', {})}>
          <Text style={styles.actionBtnText}>+ Add Person to Network</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={handleClear}>
          <Text style={[styles.actionBtnText, styles.dangerText]}>Clear All Data</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 16 },

  statsRow:       { flexDirection: 'row', gap: 12, marginBottom: 20 },
  bigStat:        { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  bigStatNum:     { fontSize: 28, fontWeight: '800', color: '#185fa5' },
  bigStatLabel:   { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },

  statCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  statLabel:  { fontSize: 11, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue:  { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  statSub:    { fontSize: 11, color: '#9ca3af', marginTop: 3 },

  breakdownRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  breakdownDot:   { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  breakdownLabel: { width: 80, fontSize: 12, color: '#555', fontWeight: '500' },
  breakdownBar:   { flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  breakdownFill:  { height: '100%', borderRadius: 4 },
  breakdownCount: { width: 24, textAlign: 'right', fontSize: 12, color: '#555', fontWeight: '700' },

  actionBtn: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#185fa5', alignItems: 'center', marginBottom: 10,
  },
  actionBtnText: { color: '#185fa5', fontSize: 14, fontWeight: '600' },
  dangerBtn:     { borderColor: '#fca5a5' },
  dangerText:    { color: '#dc2626' },
});
