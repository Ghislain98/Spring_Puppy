import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card, SectionTitle, ProgressBar, Stat } from '../components/ui';
import { useGame } from '../game/store';
import { effectiveStat, heroDps, upgradeCost } from '../game/engine';
import { xpForLevel } from '../game/config';
import { Stat as StatKey } from '../game/types';

interface UpgradeDef {
  key: StatKey;
  emoji: string;
  name: string;
  desc: string;
  color: string;
}

const UPGRADES: UpgradeDef[] = [
  { key: 'atk', emoji: '⚔️', name: 'Aiguiser la lame', desc: '+3 attaque', color: colors.hp },
  { key: 'maxHp', emoji: '🛡️', name: 'Renforcer l’armure', desc: '+20 PV max', color: colors.regen },
  { key: 'regen', emoji: '🧪', name: 'Élixir de régén.', desc: '+2 régén./s', color: colors.sommeil },
  { key: 'crit', emoji: '🎯', name: 'Œil du chasseur', desc: '+2% critique', color: colors.gold },
];

export default function HeroScreen() {
  const gold = useGame((s) => s.gold);
  const level = useGame((s) => s.level);
  const xp = useGame((s) => s.xp);
  const totalHabits = useGame((s) => s.totalHabits);
  const streak = useGame((s) => s.streak);
  const buyUpgrade = useGame((s) => s.buyUpgrade);
  const upgrades = useGame((s) => s.upgrades);
  const state = useGame();

  const dps = heroDps(state);
  const atk = effectiveStat(state, 'atk');
  const maxHp = effectiveStat(state, 'maxHp');
  const regen = effectiveStat(state, 'regen');
  const crit = Math.min(75, effectiveStat(state, 'crit'));

  const curFloor = xpForLevel(level);
  const nextFloor = xpForLevel(level + 1);
  const intoLevel = xp - curFloor;
  const levelSpan = nextFloor - curFloor;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Héros</Text>
        <View style={styles.goldBadge}>
          <Text style={styles.goldText}>💰 {gold}</Text>
        </View>
      </View>

      {/* Carte identité */}
      <Card style={{ marginBottom: spacing(4), alignItems: 'center' }}>
        <Text style={styles.avatar}>🦸</Text>
        <Text style={styles.level}>Niveau {level}</Text>
        <Text style={styles.xpText}>
          {intoLevel} / {levelSpan} XP
        </Text>
        <View style={{ width: '100%', marginTop: 8 }}>
          <ProgressBar value={intoLevel} max={levelSpan} color={colors.xp} height={10} />
        </View>
      </Card>

      {/* Stats */}
      <SectionTitle>Statistiques de combat</SectionTitle>
      <Card style={{ marginBottom: spacing(4) }}>
        <View style={styles.statGrid}>
          <Stat label="Attaque" value={atk.toFixed(0)} color={colors.hp} />
          <Stat label="PV max" value={maxHp.toFixed(0)} color={colors.regen} />
          <Stat label="Régén./s" value={regen.toFixed(0)} color={colors.sommeil} />
        </View>
        <View style={[styles.statGrid, { marginTop: 16 }]}>
          <Stat label="Critique" value={`${crit.toFixed(0)}%`} color={colors.gold} />
          <Stat label="DPS" value={dps.toFixed(0)} color={colors.text} />
          <Stat label="Habitudes" value={String(totalHabits)} color={colors.textMuted} />
        </View>
      </Card>

      {/* Forge */}
      <SectionTitle>Forge · dépense ton or</SectionTitle>
      {UPGRADES.map((u) => {
        const cost = upgradeCost(state, u.key);
        const lvl = upgrades[u.key];
        const afford = gold >= cost;
        return (
          <Pressable
            key={u.key}
            onPress={() => afford && buyUpgrade(u.key)}
            style={({ pressed }) => [
              styles.upgrade,
              { opacity: pressed && afford ? 0.7 : 1, borderColor: afford ? u.color : colors.border },
            ]}
          >
            <Text style={styles.upEmoji}>{u.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.upName}>
                {u.name} <Text style={styles.upLvl}>Niv. {lvl}</Text>
              </Text>
              <Text style={styles.upDesc}>{u.desc}</Text>
            </View>
            <View style={[styles.costPill, { backgroundColor: afford ? colors.gold : colors.bgElevated }]}>
              <Text style={[styles.costText, { color: afford ? '#2a1c00' : colors.textFaint }]}>💰 {cost}</Text>
            </View>
          </Pressable>
        );
      })}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  goldBadge: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.goldDim,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goldText: { color: colors.gold, fontWeight: '900', fontSize: font.body },
  avatar: { fontSize: 60 },
  level: { color: colors.text, fontSize: font.h2, fontWeight: '900', marginTop: 6 },
  xpText: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  statGrid: { flexDirection: 'row' },
  upgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },
  upEmoji: { fontSize: 28, marginRight: 14 },
  upName: { color: colors.text, fontSize: font.body, fontWeight: '800' },
  upLvl: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '700' },
  upDesc: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  costPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  costText: { fontWeight: '900', fontSize: font.small },
  reset: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  resetText: { color: colors.textFaint, fontSize: font.small, textDecorationLine: 'underline' },
});
