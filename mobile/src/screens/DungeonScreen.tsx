import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card, SectionTitle, ProgressBar, Stat } from '../components/ui';
import { useGame } from '../game/store';
import {
  effectiveStat,
  heroDps,
  monsterMaxHp,
  monsterAtk,
  isBossIndex,
} from '../game/engine';
import { GAME } from '../game/config';
import { DungeonLogEntry } from '../game/types';

// Petit bestiaire cosmétique pour donner un visage aux monstres.
const MOBS = ['👺', '🦇', '🕷️', '🐍', '🧟', '👹', '🦂', '🐺'];
function mobEmoji(floor: number, index: number): string {
  if (isBossIndex(index)) return '🐉';
  return MOBS[(floor + index) % MOBS.length];
}

const LOG_ICON: Record<DungeonLogEntry['kind'], string> = {
  kill: '⚔️',
  boss: '👑',
  defeat: '💀',
  loot: '✨',
  offline: '🌙',
};

export default function DungeonScreen() {
  const floor = useGame((s) => s.floor);
  const monsterIndex = useGame((s) => s.monsterIndex);
  const monsterHp = useGame((s) => s.monsterHp);
  const heroHp = useGame((s) => s.heroHp);
  const dungeonLog = useGame((s) => s.dungeonLog);
  const bestFloor = useGame((s) => s.bestFloor);
  const state = useGame();

  const mMax = monsterMaxHp(floor, monsterIndex);
  const maxHp = effectiveStat(state, 'maxHp');
  const dps = heroDps(state);
  const boss = isBossIndex(monsterIndex);
  const monstersLeft = GAME.MONSTERS_PER_FLOOR - monsterIndex;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Donjon</Text>
          <Text style={styles.sub}>Étage {floor} · record étage {bestFloor}</Text>
        </View>
        <View style={styles.floorBadge}>
          <Text style={styles.floorNum}>{floor}</Text>
          <Text style={styles.floorLbl}>étage</Text>
        </View>
      </View>

      {/* Arène */}
      <Card style={{ marginBottom: spacing(4) }}>
        <View style={styles.arena}>
          <View style={styles.fighter}>
            <Text style={styles.fighterEmoji}>🦸</Text>
            <Text style={styles.fighterName}>Héros</Text>
          </View>
          <Text style={styles.versus}>VS</Text>
          <View style={styles.fighter}>
            <Text style={styles.fighterEmoji}>{mobEmoji(floor, monsterIndex)}</Text>
            <Text style={[styles.fighterName, boss && { color: colors.gold }]}>
              {boss ? 'BOSS' : `Monstre ${monsterIndex + 1}`}
            </Text>
          </View>
        </View>

        {/* Barre de vie du monstre */}
        <Text style={styles.barLabel}>
          PV monstre · {Math.max(0, Math.ceil(monsterHp))}/{mMax}
        </Text>
        <ProgressBar value={monsterHp} max={mMax} color={boss ? colors.gold : colors.danger} height={14} />

        {/* Barre de vie du héros */}
        <Text style={[styles.barLabel, { marginTop: 12 }]}>
          PV héros · {Math.max(0, Math.ceil(heroHp))}/{Math.ceil(maxHp)}
        </Text>
        <ProgressBar value={heroHp} max={maxHp} color={colors.regen} height={14} />

        <View style={styles.combatStats}>
          <Stat label="DPS" value={dps.toFixed(0)} color={colors.hp} />
          <Stat label="Attaque ennemie" value={String(monsterAtk(floor, monsterIndex))} color={colors.danger} />
          <Stat label="Reste à l'étage" value={String(monstersLeft)} color={colors.text} />
        </View>
      </Card>

      <Card style={styles.tip}>
        <Text style={styles.tipText}>
          💡 Ton héros combat tout seul, même app fermée. Ajoute des habitudes healthy pour le rendre plus fort et
          descendre plus profond.
        </Text>
      </Card>

      <SectionTitle style={{ marginTop: spacing(4) }}>Journal du donjon</SectionTitle>
      {dungeonLog.map((e) => (
        <View key={e.id} style={styles.logRow}>
          <Text style={styles.logIcon}>{LOG_ICON[e.kind]}</Text>
          <Text style={styles.logText}>{e.text}</Text>
        </View>
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(4),
  },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  floorBadge: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  floorNum: { color: colors.gold, fontSize: font.h2, fontWeight: '900', lineHeight: 24 },
  floorLbl: { color: colors.textFaint, fontSize: font.tiny },
  arena: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 18,
  },
  fighter: { alignItems: 'center', width: 90 },
  fighterEmoji: { fontSize: 52 },
  fighterName: { color: colors.textMuted, fontSize: font.small, fontWeight: '700', marginTop: 4 },
  versus: { color: colors.textFaint, fontSize: font.body, fontWeight: '900' },
  barLabel: { color: colors.textMuted, fontSize: font.tiny, marginBottom: 5, fontWeight: '700' },
  combatStats: { flexDirection: 'row', marginTop: 18 },
  tip: { backgroundColor: colors.bgElevated },
  tipText: { color: colors.textMuted, fontSize: font.small, lineHeight: 20 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logIcon: { fontSize: 18, marginRight: 10, width: 24, textAlign: 'center' },
  logText: { flex: 1, color: colors.textMuted, fontSize: font.small, lineHeight: 18 },
});
