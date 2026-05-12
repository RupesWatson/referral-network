import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE_COLORS, TYPE_LABELS } from '../utils/colors';

export default function TypeBadge({ type, small }) {
  const colors = TYPE_COLORS[type] || { fill: '#888', light: '#f0f0f0', text: '#444' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.light }, small && styles.small]}>
      <Text style={[styles.text, { color: colors.text }, small && styles.smallText]}>
        {TYPE_LABELS[type] || type}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  text:  { fontSize: 11, fontWeight: '700' },
  small: { paddingHorizontal: 6, paddingVertical: 2 },
  smallText: { fontSize: 9 },
});
