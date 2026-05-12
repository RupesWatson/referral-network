import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function StarPicker({ value = 0, onChange, max = 5, label }) {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7}>
            <Text style={[styles.star, n <= value && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label:      { fontSize: 12, fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  row:        { flexDirection: 'row', gap: 4 },
  star:       { fontSize: 24, color: '#e5e7eb' },
  starActive: { color: '#185fa5' },
});
