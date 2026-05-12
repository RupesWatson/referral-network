import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp }   from '../context/AppContext';
import TypeBadge    from '../components/TypeBadge';
import { TYPE_COLORS, TYPE_LABELS } from '../utils/colors';
import { getInitials } from '../utils/simulation';

const FILTERS = ['All', 'Client', 'Prospect', 'Referrer', 'Adviser', 'JP Morgan', 'Organisation'];
const FILTER_MAP = {
  'All': 'all', 'Client': 'client', 'Prospect': 'prospect',
  'Referrer': 'referrer', 'Adviser': 'adviser',
  'JP Morgan': 'jpmorgan', 'Organisation': 'organisation',
};

function PersonCard({ node, onPress }) {
  const colors = TYPE_COLORS[node.type] || { fill: '#888', light: '#e0e0e0', text: '#444' };
  const stars  = node.engagementScore || 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.avatar, { backgroundColor: colors.fill }, node.type === 'organisation' && styles.orgAvatar]}>
        <Text style={styles.avatarText}>{getInitials(node.name)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={1}>{node.name}</Text>
        {node.organisation || node.sector ? (
          <Text style={styles.meta} numberOfLines={1}>
            {[node.organisation, node.sector].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
        <View style={styles.bottomRow}>
          <TypeBadge type={node.type} small />
          {stars > 0 && (
            <View style={styles.stars}>
              {Array.from({ length: 5 }, (_, i) => (
                <Text key={i} style={[styles.star, i < stars && styles.starOn]}>★</Text>
              ))}
            </View>
          )}
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function PeopleScreen() {
  const navigation = useNavigation();
  const { nodes }  = useApp();
  const [query,    setQuery]    = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return nodes
      .filter(n => n.type !== undefined)  // guard
      .filter(n => typeFilter === 'all' || n.type === typeFilter)
      .filter(n => !q || n.name.toLowerCase().includes(q) || (n.organisation || '').toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes, query, typeFilter]);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Network</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditPerson', {})}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search name or organisation…"
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Type filter pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={f => f}
        contentContainerStyle={styles.pillsWrap}
        renderItem={({ item }) => {
          const key    = FILTER_MAP[item];
          const active = typeFilter === key;
          const col    = key === 'all' ? '#185fa5' : TYPE_COLORS[key]?.fill || '#185fa5';
          return (
            <TouchableOpacity
              style={[styles.pill, active && { backgroundColor: col, borderColor: col }]}
              onPress={() => setTypeFilter(key)}
            >
              <Text style={[styles.pillText, active && styles.pillActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
        style={styles.pills}
      />

      {/* Count */}
      <Text style={styles.count}>{filtered.length} {filtered.length === 1 ? 'person' : 'people'}</Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={n => n.id}
        renderItem={({ item }) => (
          <PersonCard node={item} onPress={() => navigation.navigate('Detail', { nodeId: item.id })} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No people found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#f8f9fa' },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  addBtn:  { backgroundColor: '#185fa5', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  searchWrap: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8 },
  search: {
    backgroundColor: '#f3f4f6', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    fontSize: 14, color: '#333',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  pills:      { backgroundColor: '#fff', maxHeight: 44 },
  pillsWrap:  { paddingHorizontal: 16, paddingVertical: 6, gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' },
  pillText:   { fontSize: 11, fontWeight: '600', color: '#555' },
  pillActive: { color: '#fff' },
  count:    { paddingHorizontal: 16, paddingVertical: 6, fontSize: 11, color: '#9ca3af' },
  listContent: { paddingHorizontal: 12, paddingBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10,
    padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  orgAvatar: { borderRadius: 6 },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cardBody: { flex: 1 },
  name:     { fontSize: 14, fontWeight: '600', color: '#1a1a2e', marginBottom: 2 },
  meta:     { fontSize: 11, color: '#888', marginBottom: 4 },
  bottomRow:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars:    { flexDirection: 'row' },
  star:     { fontSize: 12, color: '#e5e7eb' },
  starOn:   { color: '#185fa5' },
  chevron:  { fontSize: 20, color: '#d1d5db', marginLeft: 8 },
  empty:    { alignItems: 'center', paddingTop: 60 },
  emptyText:{ color: '#aaa', fontSize: 15 },
});
