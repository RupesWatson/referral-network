import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp }     from '../context/AppContext';
import StarPicker     from '../components/StarPicker';

const TYPES = [
  { value: 'client',       label: 'Client' },
  { value: 'prospect',     label: 'Prospect' },
  { value: 'referrer',     label: 'Referrer' },
  { value: 'adviser',      label: 'Adviser' },
  { value: 'jpmorgan',     label: 'JP Morgan Contact' },
  { value: 'organisation', label: 'Organisation / Firm' },
];

const SECTORS = ['Private equity','Hedge fund','Tech founder','Real estate','Legal','Accounting','Family office','Banking','Corporate','Insurance','Other'];
const JPM_FOCUS = ['Hedge Funds','Private Equity','Insurance','Family Office','Real Estate','Banking','Technology','Corporate','Other'];
const JPM_ENGAGEMENT = [
  { value: 'warm',    label: 'Warm – active dialogue' },
  { value: 'active',  label: 'Active – frequent contact' },
  { value: 'cold',    label: 'Cold – no recent contact' },
  { value: 'prospect',label: 'Prospect – not yet engaged' },
];

function FieldLabel({ children, required }) {
  return (
    <Text style={styles.label}>
      {children}{required ? <Text style={{ color: '#e53e3e' }}> *</Text> : null}
    </Text>
  );
}

function InputField({ label, required, ...props }) {
  return (
    <View style={styles.formGroup}>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}
      <TextInput style={styles.input} placeholderTextColor="#bbb" {...props} />
    </View>
  );
}

function SelectPills({ label, options, value, onChange }) {
  return (
    <View style={styles.formGroup}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(opt => {
          const v = typeof opt === 'string' ? opt : opt.value;
          const l = typeof opt === 'string' ? opt : opt.label;
          const active = value === v;
          return (
            <TouchableOpacity
              key={v}
              style={[styles.selPill, active && styles.selPillActive]}
              onPress={() => onChange(v)}
            >
              <Text style={[styles.selPillText, active && styles.selPillTextActive]}>{l}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const EMPTY = {
  name: '', type: '', organisation: '', sector: '', estimatedAUM: '',
  engagementScore: 3, referralLikelihood: 3, notes: '', introducedBy: '',
  areaOfFocus: '', firmsCovered: '', jpmTitle: '', jpmEngagement: 'warm',
  industry: '', website: '', keyContacts: '',
};

export default function AddEditPersonScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { nodes, addNode, updateNode, getNode } = useApp();

  const editId  = route.params?.nodeId;
  const editNode= editId ? getNode(editId) : null;
  const isEdit  = !!editNode;

  const [form, setForm] = useState(isEdit ? { ...EMPTY, ...editNode } : EMPTY);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const isCommon = !['jpmorgan', 'organisation'].includes(form.type);
  const isJPM    = form.type === 'jpmorgan';
  const isOrg    = form.type === 'organisation';

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name = 'Name is required';
    if (!form.type)         e.type = 'Type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isEdit) {
      updateNode(editId, form);
    } else {
      addNode(form);
    }
    navigation.goBack();
  };

  const prospectOptions = nodes
    .filter(n => n.type !== 'organisation' && (!isEdit || n.id !== editId))
    .map(n => ({ value: n.id, label: n.name }));

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Person' : 'Add Person'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.save}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Name */}
          <View style={styles.formGroup}>
            <FieldLabel required>Name</FieldLabel>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Full name"
              placeholderTextColor="#bbb"
              value={form.name}
              onChangeText={v => set('name', v)}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Type */}
          <View style={styles.formGroup}>
            <FieldLabel required>Type</FieldLabel>
            <View style={[styles.typeGrid, errors.type && styles.inputError]}>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeBtn, form.type === t.value && styles.typeBtnActive]}
                  onPress={() => set('type', t.value)}
                >
                  <Text style={[styles.typeBtnText, form.type === t.value && styles.typeBtnTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.type ? <Text style={styles.errorText}>{errors.type}</Text> : null}
          </View>

          {/* Organisation (all types) */}
          <InputField label="Organisation" value={form.organisation} onChangeText={v => set('organisation', v)} placeholder="e.g. Hartley Capital" />

          {/* Common fields */}
          {isCommon && (
            <>
              <SelectPills label="Sector" options={SECTORS} value={form.sector} onChange={v => set('sector', v)} />
              <InputField label="Estimated AUM" value={form.estimatedAUM} onChangeText={v => set('estimatedAUM', v)} placeholder="e.g. >£50m" />
              <View style={styles.formGroup}>
                <StarPicker label="Engagement" value={form.engagementScore} onChange={v => set('engagementScore', v)} />
              </View>
              <View style={styles.formGroup}>
                <StarPicker label="Referral Likelihood" value={form.referralLikelihood} onChange={v => set('referralLikelihood', v)} />
              </View>
            </>
          )}

          {/* JP Morgan specific */}
          {isJPM && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>JP Morgan Details</Text>
              </View>
              <InputField label="Role / Title" value={form.jpmTitle} onChangeText={v => set('jpmTitle', v)} placeholder="e.g. Managing Director" />
              <SelectPills label="Area of Focus" options={JPM_FOCUS} value={form.areaOfFocus} onChange={v => set('areaOfFocus', v)} />
              <View style={styles.formGroup}>
                <FieldLabel>Firms / Clients Covered</FieldLabel>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="e.g. Bridgewater, Man Group"
                  placeholderTextColor="#bbb"
                  value={form.firmsCovered}
                  onChangeText={v => set('firmsCovered', v)}
                  multiline numberOfLines={3}
                />
              </View>
              <SelectPills label="Engagement Level" options={JPM_ENGAGEMENT} value={form.jpmEngagement} onChange={v => set('jpmEngagement', v)} />
            </View>
          )}

          {/* Organisation specific */}
          {isOrg && (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, styles.sectionHeaderOrg]}>
                <Text style={[styles.sectionHeaderText, styles.sectionHeaderTextOrg]}>Organisation Details</Text>
              </View>
              <InputField label="Industry" value={form.industry} onChangeText={v => set('industry', v)} placeholder="e.g. Asset Management" />
              <InputField label="AUM / Size" value={form.estimatedAUM} onChangeText={v => set('estimatedAUM', v)} placeholder="e.g. >£100m" />
              <InputField label="Website" value={form.website} onChangeText={v => set('website', v)} placeholder="e.g. hartleycapital.com" />
              <View style={styles.formGroup}>
                <FieldLabel>Key Contacts</FieldLabel>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="e.g. James Hartley, Sarah Chen"
                  placeholderTextColor="#bbb"
                  value={form.keyContacts}
                  onChangeText={v => set('keyContacts', v)}
                  multiline numberOfLines={3}
                />
              </View>
            </View>
          )}

          {/* Introduced By */}
          <View style={styles.formGroup}>
            <FieldLabel>Introduced By</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.selPill, !form.introducedBy && styles.selPillActive]}
                onPress={() => set('introducedBy', '')}
              >
                <Text style={[styles.selPillText, !form.introducedBy && styles.selPillTextActive]}>None</Text>
              </TouchableOpacity>
              {prospectOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.selPill, form.introducedBy === opt.value && styles.selPillActive]}
                  onPress={() => set('introducedBy', opt.value)}
                >
                  <Text style={[styles.selPillText, form.introducedBy === opt.value && styles.selPillTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <FieldLabel>Notes</FieldLabel>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Any additional notes…"
              placeholderTextColor="#bbb"
              value={form.notes}
              onChangeText={v => set('notes', v)}
              multiline numberOfLines={4}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  cancel: { fontSize: 15, color: '#6b7280' },
  save:   { fontSize: 15, fontWeight: '700', color: '#185fa5' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  formGroup:   { marginBottom: 16 },
  label:       { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: '#888780', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#333', backgroundColor: '#fff',
  },
  textarea:   { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#e53e3e' },
  errorText:  { color: '#e53e3e', fontSize: 11, marginTop: 4 },
  typeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    padding: 4, borderRadius: 8,
  },
  typeBtn: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  typeBtnActive:     { backgroundColor: '#185fa5', borderColor: '#185fa5' },
  typeBtnText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  typeBtnTextActive: { color: '#fff', fontWeight: '700' },
  selPill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6', marginRight: 8,
  },
  selPillActive:     { backgroundColor: '#185fa5', borderColor: '#185fa5' },
  selPillText:       { fontSize: 12, color: '#555', fontWeight: '500' },
  selPillTextActive: { color: '#fff', fontWeight: '600' },
  section:    { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionHeader: { backgroundColor: '#dce9f5', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12 },
  sectionHeaderOrg: { backgroundColor: '#f0f0f0' },
  sectionHeaderText: { fontSize: 11, fontWeight: '700', color: '#003087', textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionHeaderTextOrg: { color: '#374151' },
});
