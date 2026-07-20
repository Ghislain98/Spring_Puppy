import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card, ProgressBar } from '../components/ui';
import { useGame } from '../game/store';
import { GAME, COMPANIONS } from '../game/config';
import { derive, fmt, monsterMaxHp, monsterAtk, isBoss, compCost } from '../game/engine';

const MOBS = ['👺', '🦇', '🕷️', '🐍', '🧟', '👹', '🦂', '🐗'];
const mobEmoji = (f: number, i: number) => (isBoss(i) ? '🐉' : MOBS[(f + i) % MOBS.length]);

interface Floaty { id: number; text: string; color: string; crit: boolean; x: number; }
let floatId = 0;

export default function DungeonScreen() {
  const s = useGame();
  const tapMonster = useGame((st) => st.tapMonster);
  const buyCompanion = useGame((st) => st.buyCompanion);
  const d = derive(s);
  const boss = isBoss(s.monsterIndex);
  const mMax = monsterMaxHp(s.floor, s.monsterIndex);
  const [floats, setFloats] = useState<Floaty[]>([]);
  const [buyAmt, setBuyAmt] = useState<number | 'max'>(1);
  const hitAnim = useRef(new Animated.Value(1)).current;

  const spawn = (text: string, color: string, crit: boolean) => {
    const f = { id: floatId++, text, color, crit, x: 30 + Math.random() * 40 };
    setFloats((cur) => [...cur, f]);
    setTimeout(() => setFloats((cur) => cur.filter((x) => x.id !== f.id)), 850);
  };

  const onTap = () => {
    const r = tapMonster();
    spawn((r.crit ? '✦ ' : '') + fmt(r.amount), r.crit ? colors.gold : colors.xp, r.crit);
    Animated.sequence([
      Animated.timing(hitAnim, { toValue: 0.88, duration: 60, useNativeDriver: true }),
      Animated.spring(hitAnim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
  };

  const amountFor = (base: number, have: number): number => {
    if (buyAmt === 'max') {
      let n = 0, g = s.gold, c = compCost(base, have);
      while (g >= c && n < 9999) { g -= c; n++; c = compCost(base, have + n); }
      return Math.max(1, n);
    }
    return buyAmt;
  };
  const bulkCost = (base: number, have: number, amt: number) => {
    let c = 0;
    for (let k = 0; k < amt; k++) c += compCost(base, have + k);
    return c;
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Donjon</Text>
          <Text style={styles.sub}>Étage {s.floor} · record {s.bestFloor}</Text>
        </View>
        <View style={styles.floorBadge}><Text style={styles.floorNum}>{s.floor}</Text><Text style={styles.floorLbl}>étage</Text></View>
      </View>

      <Card style={{ alignItems: 'center' }}>
        <View style={styles.floatLayer} pointerEvents="none">
          {floats.map((f) => (
            <FloatingText key={f.id} text={f.text} color={f.color} crit={f.crit} x={f.x} />
          ))}
        </View>
        <Pressable onPress={onTap} hitSlop={20}>
          <Animated.Text style={[styles.mob, { transform: [{ scale: hitAnim }] }]}>{mobEmoji(s.floor, s.monsterIndex)}</Animated.Text>
        </Pressable>
        <Text style={[styles.mobName, boss && { color: colors.gold }]}>{boss ? '⚜ BOSS ⚜' : `Monstre ${s.monsterIndex + 1}`}</Text>
        <Text style={styles.tapHint}>👆 Tape le monstre pour frapper</Text>
        <View style={{ width: '100%', marginTop: 10 }}>
          <ProgressBar value={s.monsterHp} max={mMax} color={boss ? colors.gold : colors.hp} height={14} />
        </View>
        <View style={styles.stats}>
          <Stat label="DPS" value={fmt(d.dps)} color={colors.hp} />
          <Stat label="Dégâts/clic" value={fmt(d.clickDmg)} color={colors.xp} />
          <Stat label="Or/sec" value={fmt(d.goldSec)} color={colors.gold} />
          <Stat label="Reste" value={String(GAME.MPF - s.monsterIndex)} color={colors.text} />
        </View>
      </Card>

      <Card style={{ paddingVertical: 11 }}>
        <ProgressBar value={s.heroHp} max={d.maxHp} color={colors.regen} height={9} />
        <Text style={styles.hpLbl}>PV héros {Math.max(0, Math.ceil(s.heroHp))}/{Math.ceil(d.maxHp)}</Text>
      </Card>

      <Text style={styles.section}>⚒️ Compagnons · or/sec</Text>
      <View style={styles.amtRow}>
        {[1, 10, 'max'].map((a) => (
          <Pressable key={String(a)} onPress={() => setBuyAmt(a as number | 'max')} style={[styles.amtBtn, buyAmt === a && styles.amtOn]}>
            <Text style={[styles.amtTxt, buyAmt === a && { color: '#2a1c00' }]}>×{a}</Text>
          </Pressable>
        ))}
      </View>
      {COMPANIONS.map((cp) => {
        const have = s.companions[cp.id] || 0;
        const amt = amountFor(cp.base, have);
        const cost = bulkCost(cp.base, have, amt);
        const can = s.gold >= cost;
        return (
          <Pressable key={cp.id} onPress={() => buyCompanion(cp.id, amt)} style={[styles.buy, { borderColor: can ? colors.gold : colors.border, opacity: can ? 1 : 0.65 }]}>
            <Text style={styles.buyEm}>{cp.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.buyNm}>{cp.name} <Text style={styles.buySmall}>{fmt(cp.rate)}/s ch.</Text></Text>
              <Text style={styles.buyDs}>produit {fmt(have * cp.rate)}/s</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.buyCnt}>{have}</Text>
              <Text style={[styles.buyCost, { color: can ? colors.gold : colors.textFaint }]}>💰{fmt(cost)}{buyAmt !== 1 ? ` ×${amt}` : ''}</Text>
            </View>
          </Pressable>
        );
      })}

      <Text style={styles.section}>📜 Journal</Text>
      {s.dungeonLog.map((t, i) => (
        <View key={i} style={styles.logRow}><Text style={styles.logIc}>{t.slice(0, 2).trim()}</Text><Text style={styles.logTxt}>{t.slice(2)}</Text></View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function FloatingText({ text, color, crit, x }: { text: string; color: string; crit: boolean; x: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: -60, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(op, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.Text style={{ position: 'absolute', left: `${x}%`, top: 20, color, fontWeight: '900', fontSize: crit ? 26 : 16, opacity: op, transform: [{ translateY: y }] }}>
      {text}
    </Animated.Text>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.cstat}>
      <Text style={[styles.cstatV, { color }]}>{value}</Text>
      <Text style={styles.cstatL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  floorBadge: { alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 6 },
  floorNum: { color: colors.gold, fontSize: font.h2, fontWeight: '900', lineHeight: 24 },
  floorLbl: { color: colors.textFaint, fontSize: font.tiny },
  floatLayer: { position: 'absolute', top: 0, left: 0, right: 0, height: 90, zIndex: 5 },
  mob: { fontSize: 76, marginTop: 4 },
  mobName: { fontSize: 17, fontWeight: '800', color: colors.textMuted, marginTop: 4 },
  tapHint: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },
  stats: { flexDirection: 'row', marginTop: 16, gap: 6 },
  cstat: { flex: 1, alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 8 },
  cstatV: { fontSize: 15, fontWeight: '800' },
  cstatL: { color: colors.textFaint, fontSize: 10, marginTop: 2 },
  hpLbl: { color: colors.textMuted, fontSize: font.tiny, marginTop: 5, fontWeight: '700' },
  section: { color: colors.gold, fontSize: font.small, fontWeight: '800', marginTop: spacing(4), marginBottom: 8 },
  amtRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  amtBtn: { flex: 1, alignItems: 'center', backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 7 },
  amtOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  amtTxt: { color: colors.textMuted, fontWeight: '800', fontSize: font.small },
  buy: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.card, borderWidth: 1.5, borderRadius: 14, padding: 11, marginBottom: 8 },
  buyEm: { fontSize: 26, width: 32, textAlign: 'center' },
  buyNm: { color: colors.text, fontWeight: '800', fontSize: font.small },
  buySmall: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '700' },
  buyDs: { color: colors.textMuted, fontSize: font.small, marginTop: 1 },
  buyCnt: { color: colors.gold, fontSize: font.h3, fontWeight: '900' },
  buyCost: { fontSize: font.small, fontWeight: '900' },
  logRow: { flexDirection: 'row', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  logIc: { width: 20, textAlign: 'center', fontSize: 14 },
  logTxt: { flex: 1, color: colors.textMuted, fontSize: font.small },
});
