import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, font } from '../theme';
import { useGame } from '../game/store';
import { derive, fmt, buffOn, elanOn } from '../game/engine';

export default function CurrencyBar() {
  const s = useGame();
  const d = derive(s);
  return (
    <View style={styles.row}>
      <View style={styles.box}>
        <Text style={styles.ic}>💰</Text>
        <View>
          <Text style={[styles.v, { color: colors.gold }]}>{fmt(s.gold)}</Text>
          <Text style={styles.s}>+{fmt(d.goldSec)}/s</Text>
        </View>
      </View>
      <View style={styles.box}>
        <Text style={styles.ic}>💎</Text>
        <View>
          <Text style={[styles.v, { color: colors.gem }]}>{fmt(s.gems)}</Text>
          <Text style={styles.s}>gemmes</Text>
        </View>
      </View>
      {buffOn(s) && (
        <View style={[styles.box, styles.pillBox]}>
          <Text style={[styles.pill, { backgroundColor: colors.gold }]}>✨ ×1,5</Text>
        </View>
      )}
      {elanOn(s) && (
        <View style={[styles.box, styles.pillBox]}>
          <Text style={[styles.pill, { backgroundColor: colors.regen }]}>⚡ ×2</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgElevated },
  box: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  pillBox: { flex: 0, paddingHorizontal: 6 },
  ic: { fontSize: 18 },
  v: { fontWeight: '900', fontSize: 16, lineHeight: 17 },
  s: { color: colors.textFaint, fontSize: 10, fontWeight: '700' },
  pill: { color: '#08140f', fontWeight: '900', fontSize: 11, overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
});
