import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius, font } from '../theme';
import { Card } from '../components/ui';
import { useGame } from '../game/store';
import { TALENTS } from '../game/config';
import { fmt, talCost } from '../game/engine';
import { haptics } from '../game/fx';

export default function TalentsScreen() {
  const s = useGame();
  const buyTalent = useGame((st) => st.buyTalent);
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Talents</Text>
        <View style={styles.pill}><Text style={styles.pillTxt}>💎 {fmt(s.gems)}</Text></View>
      </View>
      <Card style={{ marginBottom: 14 }}>
        <Text style={styles.intro}>Dépense tes <Text style={{ color: colors.gem, fontWeight: '800' }}>gemmes</Text> (boss, montées de niveau, check-ins, paliers d'objectif) pour des bonus <Text style={{ fontWeight: '800' }}>permanents</Text>.</Text>
      </Card>
      {TALENTS.map((t) => {
        const lvl = s.talents[t.id] || 0;
        const maxed = lvl >= t.max;
        const cost = talCost(t.base, lvl);
        const can = !maxed && s.gems >= cost;
        return (
          <Pressable key={t.id} onPress={() => { if (buyTalent(t.id)) haptics.buy(); }} style={[styles.buy, { borderColor: can ? colors.gem : colors.border, opacity: maxed || can ? 1 : 0.65 }]}>
            <Text style={styles.em}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nm}>{t.name} <Text style={styles.small}>Niv. {lvl}/{t.max}</Text></Text>
              <Text style={styles.ds}>{t.desc}</Text>
            </View>
            <Text style={[styles.cost, { color: maxed ? colors.success : can ? colors.gem : colors.textFaint }]}>{maxed ? 'MAX' : `💎${fmt(cost)}`}</Text>
          </Pressable>
        );
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  pill: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
  pillTxt: { color: colors.gem, fontWeight: '900', fontSize: font.body },
  intro: { color: colors.textMuted, fontSize: font.small, lineHeight: 20 },
  buy: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1.5, borderRadius: 14, padding: 13, marginBottom: 10 },
  em: { fontSize: 26, width: 32, textAlign: 'center' },
  nm: { color: colors.text, fontWeight: '800', fontSize: font.body },
  small: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '700' },
  ds: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  cost: { fontWeight: '900', fontSize: font.small },
});
