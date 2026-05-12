import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { RELATIONSHIP_TYPES, STRENGTH_LABELS } from '../utils/colors';

export default function AddConnectionScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { nodes, addEdge, getNode } = useApp();

  const { sourceId: initSource, targetId: initTarget } = route.params || {};

  const [sourceId,  setSourceId]  = useState(initSource || '');
  const [targetId,  setTargetId]  = useState(initTarget || '');
  const [relType,   setRelType]   = useState('referred');
  const [strength,  setStrength]  = useState(2);
  const [notes,     setNotes]     = useState('');
  const [errors,    setErrors]    = useState({});

  const sourceNode = getNode(sourceId);
  const targetNode = getNode(targetId);

  const validate = () => {
    const e = {};
    if (!sourceId) e.source = 'Select a source';
    if (!targetId) e.target = 'Select a target';
    if (sourceId === targetId) e.target = 'Source and target must be different';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addEdge({ sourceId, targetId, relationshipType: relType, strength, notes });
    navigation.goBack();
  };

  const personOptions = nodes.filter(n => n.type !== undefined);

  const NodeSelector = ({ label, value, onSelect, error }) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optScroll}>
        {personOptions.map(n => (
          <TouchableOpacity
            key={n.id}
            style={[styles.selPill, value === n.id && styles.selPillActive]}
            onPress={() => onSelect(n.id)}
          >
            <Text style={[styles.selPillText, value === n.id && styles.selPillTextActive]}>{n.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Connection</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* If source/target pre-set, show them read-only */}
        {sourceNode && targetNode ? (
          <View style={styles.presetBanner}>
            <Text style={styles.presetText}>
              {sourceNode.name}  →  {targetNode.name}
            </Text>
          </View>
        ) : (
          <>
            <NodeSelector
              label="FROM *"
              value={sourceId}
              onSelect={setSourceId}
              error={errors.source}
            />
            <NodeSelector
              label="TO *"
              value={targetId}
              onSelect={v => { if (v !== sourceId) setTargetId(v); }}
              error={errors.target}
            />
          </>
        )}

        {/* Relationship type */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>RELATIONSHIP TYPE</Text>
          <View style={styles.typeGrid}>
            {RELATIONSHIP_TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeBtn, relType === t.value && styles.typeBtnActive]}
                onPress={() => setRelType(t.value)}
              >
                <Text style={[styles.typeBtnText, relType === t.value && styles.typeBtnTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Strength */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>STRENGTH</Text>
          <View style={styles.strengthRow}>
            {[1, 2, 3].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.strengthBtn, strength === s && styles.strengthBtnActive]}
                onPress={() => setStrength(s)}
              >
                <Text style={[styles.strengthNum, strength === s && styles.strengthNumActive]}>{s}</Text>
                <Text style={[styles.strengthLabel, strength === s && styles.strengthLabelActive]}>
                  {STRENGTH_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>NOTES (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="e.g. Met at Davos 2024"
            placeholderTextColor="#bbb"
            value={notes}
            onChangeText={setNotes}
            multiline numberOfLines={3}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f8f9fa' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  cancel:      { fontSize: 15, color: '#6b7280' },
  save:        { fontSize: 15, fontWeight: '700', color: '#185fa5' },
  scroll:      { padding: 16, paddingBottom: 40 },
  formGroup:   { marginBottom: 18 },
  label:       { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: '#888780', marginBottom: 8 },
  errorText:   { color: '#e53e3e', fontSize: 11, marginBottom: 4 },
  optScroll:   { maxHeight: 44 },
  selPill: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6', marginRight: 8,
  },
  selPillActive:     { backgroundColor: '#185fa5', borderColor: '#185fa5' },
  selPillText:       { fontSize: 12, color: '#555', fontWeight: '500' },
  selPillTextActive: { color: '#fff', fontWeight: '600' },
  presetBanner: { backgroundColor: '#e6f1fb', borderRadius: 10, padding: 14, marginBottom: 16, alignItems: 'center' },
  presetText:   { fontSize: 15, fontWeight: '600', color: '#185fa5' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 8, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  typeBtnActive:     { backgroundColor: '#185fa5', borderColor: '#185fa5' },
  typeBtnText:       { fontSize: 13, color: '#555' },
  typeBtnTextActive: { color: '#fff', fontWeight: '700' },
  strengthRow: { flexDirection: 'row', gap: 10 },
  strengthBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb', alignItems: 'center',
  },
  strengthBtnActive:    { backgroundColor: '#185fa5', borderColor: '#185fa5' },
  strengthNum:          { fontSize: 20, fontWeight: '700', color: '#333' },
  strengthNumActive:    { color: '#fff' },
  strengthLabel:        { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  strengthLabelActive:  { color: 'rgba(255,255,255,0.8)' },
  input:    { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333', backgroundColor: '#fff' },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
});
