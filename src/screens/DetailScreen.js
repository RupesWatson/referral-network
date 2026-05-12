import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp }     from '../context/AppContext';
import TypeBadge      from '../components/TypeBadge';
import { TYPE_COLORS, RELATIONSHIP_TYPES, STRENGTH_LABELS } from '../utils/colors';
import { getInitials } from '../utils/simulation';

// ── Field row component ────────────────────────────────────────────────────
function FieldRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function Stars({ value, max = 5 }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: max }, (_, i) => (
        <Text key={i} style={{ fontSize: 16, color: i < value ? '#185fa5' : '#e5e7eb' }}>★</Text>
      ))}
    </View>
  );
}

// ── Node detail view ───────────────────────────────────────────────────────
function NodeDetail({ node }) {
  const navigation = useNavigation();
  const { nodes, edges, deleteNode, deleteEdge, getNodeEdges } = useApp();
  const colors = TYPE_COLORS[node.type] || { fill: '#888', light: '#e0e0e0' };

  const nodeEdges = getNodeEdges(node.id);
  const isCommon  = !['jpmorgan', 'organisation'].includes(node.type);
  const isJPM     = node.type === 'jpmorgan';
  const isOrg     = node.type === 'organisation';

  const handleDelete = () => {
    Alert.alert('Delete Person', `Delete "${node.name}"? All their connections will also be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteNode(node.id); navigation.goBack(); },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>

      {/* Header */}
      <View style={styles.detailHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.fill }, node.type === 'organisation' && styles.orgAvatar]}>
          <Text style={styles.avatarText}>{getInitials(node.name)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.detailName}>{node.name}</Text>
          {node.organisation ? <Text style={styles.detailOrg}>{node.organisation}</Text> : null}
          <TypeBadge type={node.type} />
        </View>
      </View>

      {/* Common fields */}
      {isCommon && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFILE</Text>
          <FieldRow label="Sector"        value={node.sector} />
          <FieldRow label="Estimated AUM" value={node.estimatedAUM} />
          {node.engagementScore > 0 && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Engagement</Text>
              <Stars value={node.engagementScore} />
            </View>
          )}
          {node.referralLikelihood > 0 && (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Referral Likelihood</Text>
              <Stars value={node.referralLikelihood} />
            </View>
          )}
        </View>
      )}

      {/* JP Morgan */}
      {isJPM && (
        <View style={styles.section}>
          <View style={styles.jpmHeader}><Text style={styles.jpmHeaderText}>JP Morgan Details</Text></View>
          <FieldRow label="Title"          value={node.jpmTitle} />
          <FieldRow label="Area of Focus"  value={node.areaOfFocus} />
          <FieldRow label="Firms Covered"  value={node.firmsCovered} />
          <FieldRow label="Engagement"     value={node.jpmEngagement} />
        </View>
      )}

      {/* Organisation */}
      {isOrg && (
        <View style={styles.section}>
          <View style={styles.orgHeader}><Text style={styles.orgHeaderText}>Organisation Details</Text></View>
          <FieldRow label="Industry"      value={node.industry} />
          <FieldRow label="AUM / Size"    value={node.estimatedAUM} />
          <FieldRow label="Key Contacts"  value={node.keyContacts} />
          {node.website ? (
            <TouchableOpacity style={styles.fieldRow} onPress={() => Linking.openURL(`https://${node.website}`)}>
              <Text style={styles.fieldLabel}>Website</Text>
              <Text style={[styles.fieldValue, styles.link]}>{node.website}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Notes */}
      {node.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTES</Text>
          <Text style={styles.notes}>{node.notes}</Text>
        </View>
      ) : null}

      {/* Connections */}
      <View style={styles.section}>
        <View style={styles.connHeader}>
          <Text style={styles.sectionTitle}>CONNECTIONS ({nodeEdges.length})</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddConnection', { sourceId: node.id })}
          >
            <Text style={styles.addConnBtn}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {nodeEdges.length === 0 ? (
          <Text style={styles.emptyConn}>No connections yet</Text>
        ) : nodeEdges.map(edge => {
          const otherId = edge.sourceId === node.id ? edge.targetId : edge.sourceId;
          const other   = nodes.find(n => n.id === otherId);
          const relInfo = RELATIONSHIP_TYPES.find(r => r.value === edge.relationshipType);
          const otherColors = TYPE_COLORS[other?.type] || { fill: '#888' };
          return (
            <View key={edge.id} style={styles.connRow}>
              <View style={[styles.connAvatar, { backgroundColor: otherColors.fill }]}>
                <Text style={styles.connAvatarText}>{getInitials(other?.name || '?')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.connName}>{other?.name || 'Unknown'}</Text>
                <Text style={styles.connRel}>
                  {relInfo?.label || edge.relationshipType} · {STRENGTH_LABELS[edge.strength]}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Remove Connection', 'Remove this connection?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => deleteEdge(edge.id) },
                ])}
              >
                <Text style={styles.delConnBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddEditPerson', { nodeId: node.id })}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Edge detail view ───────────────────────────────────────────────────────
function EdgeDetail({ edge }) {
  const navigation = useNavigation();
  const { nodes, deleteEdge } = useApp();
  const src = nodes.find(n => n.id === edge.sourceId);
  const tgt = nodes.find(n => n.id === edge.targetId);
  const relInfo = RELATIONSHIP_TYPES.find(r => r.value === edge.relationshipType);

  const handleDelete = () => {
    Alert.alert('Remove Connection', 'Remove this connection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => { deleteEdge(edge.id); navigation.goBack(); },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.detailHeader}>
        <View style={[styles.avatar, { backgroundColor: '#f59e0b' }]}>
          <Text style={styles.avatarText}>⟷</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.detailName}>{src?.name} → {tgt?.name}</Text>
          <Text style={styles.detailOrg}>{relInfo?.label || edge.relationshipType}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DETAILS</Text>
        <FieldRow label="From"         value={src?.name} />
        <FieldRow label="To"           value={tgt?.name} />
        <FieldRow label="Relationship" value={relInfo?.label || edge.relationshipType} />
        <FieldRow label="Strength"     value={`${edge.strength} – ${STRENGTH_LABELS[edge.strength]}`} />
        {edge.notes ? <FieldRow label="Notes" value={edge.notes} /> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Remove Connection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function DetailScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { getNode, getEdge } = useApp();

  const { nodeId, edgeId } = route.params || {};
  const node = nodeId ? getNode(nodeId) : null;
  const edge = edgeId ? getEdge(edgeId) : null;

  if (!node && !edge) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Details</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#aaa' }}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const title = node ? node.name : `${getNode(edge.sourceId)?.name} → ${getNode(edge.targetId)?.name}`;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 30 }} />
      </View>

      {node ? <NodeDetail node={node} /> : <EdgeDetail edge={edge} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  close:       { fontSize: 18, color: '#6b7280', width: 30 },
  scroll:      { padding: 16, paddingBottom: 40 },
  detailHeader:{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 14 },
  avatar:      { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  orgAvatar:   { borderRadius: 10 },
  avatarText:  { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerInfo:  { flex: 1, justifyContent: 'center' },
  detailName:  { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  detailOrg:   { fontSize: 13, color: '#888', marginBottom: 6 },
  section:     { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle:{ fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  fieldRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  fieldLabel:  { fontSize: 12, color: '#9ca3af', flex: 1 },
  fieldValue:  { fontSize: 12, color: '#1a1a2e', fontWeight: '500', flex: 2, textAlign: 'right' },
  link:        { color: '#185fa5', textDecorationLine: 'underline' },
  notes:       { fontSize: 13, color: '#555', lineHeight: 20 },
  jpmHeader:   { backgroundColor: '#dce9f5', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  jpmHeaderText: { fontSize: 11, fontWeight: '700', color: '#003087', textTransform: 'uppercase', letterSpacing: 0.5 },
  orgHeader:   { backgroundColor: '#f0f0f0', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  orgHeaderText:{ fontSize: 11, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },
  connHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addConnBtn:  { fontSize: 13, color: '#185fa5', fontWeight: '600' },
  emptyConn:   { fontSize: 13, color: '#aaa', textAlign: 'center', padding: 12 },
  connRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 10 },
  connAvatar:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  connAvatarText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  connName:    { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  connRel:     { fontSize: 11, color: '#9ca3af' },
  delConnBtn:  { fontSize: 16, color: '#d1d5db', padding: 4 },
  actions:     { flexDirection: 'row', gap: 12, marginTop: 8 },
  editBtn:     { flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  editBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  deleteBtn:   { flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },
});
