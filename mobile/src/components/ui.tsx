import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { colors, radius, font } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.section, style]}>{children}</Text>;
}

export function ProgressBar({
  value,
  max,
  color,
  height = 12,
  track = colors.bgElevated,
}: {
  value: number;
  max: number;
  color: string;
  height?: number;
  track?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <View style={[styles.track, { height, backgroundColor: track, borderRadius: height }]}>
      <View style={{ width: `${pct * 100}%`, backgroundColor: color, height: '100%', borderRadius: height }} />
    </View>
  );
}

export function Chip({
  label,
  color = colors.textMuted,
  bg = colors.bgElevated,
}: {
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: font.tiny, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color, fontSize: font.h3, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  track: { width: '100%', overflow: 'hidden' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
});
