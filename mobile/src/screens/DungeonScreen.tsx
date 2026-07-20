import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card, ProgressBar } from '../components/ui';
import { useGame } from '../game/store';
import { GAME, COMPANIONS, biomeName } from '../game/config';
import { derive, fmt, monsterMaxHp, isBoss, compCost } from '../game/engine';
import { haptics } from '../game/fx';

const MOBS = ['👺', '🦇', '🕷️', '🐍', '🧟', '👹', '🦂', '🐗'];
const mobEmoji = (f: number, i: number) => (isBoss(i) ? '🐉' : MOBS[(f + i) % MOBS.length]);

type Fx =
  | { id: number; kind: 'float'; text: string; color: string; crit: boolean; x: number }
  | { id: number; kind: 'particle'; color: string; angle: number; dist: number; size: number }
  | { id: number; kind: 'coin' }
  | { id: number; kind: 'ring' }
  | { id: number; kind: 'ghost'; emoji: string };
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
type FxInput = DistributiveOmit<Fx, 'id'>;
let fxId = 0;

export default function DungeonScreen() {
  const s = useGame();
  const tapMonster = useGame((st) => st.tapMonster);
  const buyCompanion = useGame((st) => st.buyCompanion);
  const d = derive(s);
  const boss = isBoss(s.monsterIndex);
  const mMax = monsterMaxHp(s.floor, s.monsterIndex);

  const [fx, setFx] = useState<Fx[]>([]);
  const [levelToast, setLevelToast] = useState<number | null>(null);
  const [buyAmt, setBuyAmt] = useState<number | 'max'>(1);
  const hitAnim = useRef(new Animated.Value(1)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  const prevKills = useRef(s.kills);
  const prevFloor = useRef(s.floor);
  const prevLevel = useRef(s.level);

  const addFx = (item: FxInput) => {
    const withId = { ...item, id: fxId++ } as Fx;
    setFx((cur) => [...cur.slice(-40), withId]);
  };
  const remove = (id: number) => setFx((cur) => cur.filter((f) => f.id !== id));
  const burst = (n: number, color: string) => {
    for (let i = 0; i < n; i++) addFx({ kind: 'particle', color, angle: Math.random() * Math.PI * 2, dist: 30 + Math.random() * 46, size: 5 + Math.random() * 4 });
  };
  const coins = (n: number) => { for (let i = 0; i < n; i++) addFx({ kind: 'coin' }); };

  // Bob permanent du monstre
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -8, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  // Réactions aux changements d'état (couvre kills auto + tap)
  useEffect(() => {
    if (s.kills > prevKills.current) { burst(boss ? 18 : 8, boss ? colors.gold : colors.hp); coins(boss ? 8 : 3); haptics.kill(); }
    prevKills.current = s.kills;
    if (s.floor > prevFloor.current) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      haptics.boss();
    }
    prevFloor.current = s.floor;
    if (s.level > prevLevel.current) { setLevelToast(s.level); haptics.level(); setTimeout(() => setLevelToast(null), 1200); }
    prevLevel.current = s.level;
  }, [s.kills, s.floor, s.level]);

  const onTap = () => {
    const oldEmoji = mobEmoji(s.floor, s.monsterIndex);
    const r = tapMonster();
    addFx({ kind: 'float', text: (r.crit ? '✦ ' : '') + fmt(r.amount), color: r.crit ? colors.gold : colors.xp, crit: r.crit, x: 30 + Math.random() * 40 });
    addFx({ kind: 'ring' });
    burst(r.crit ? 10 : 5, r.crit ? colors.gold : colors.xp);
    if (r.killed) addFx({ kind: 'ghost', emoji: oldEmoji });
    Animated.sequence([
      Animated.timing(hitAnim, { toValue: 0.86, duration: 55, useNativeDriver: true }),
      Animated.spring(hitAnim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
    if (r.crit) haptics.crit(); else haptics.tap();
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
  const doBuy = (id: string, amt: number) => { if (buyCompanion(id, amt)) haptics.buy(); };

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] });

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Donjon</Text>
          <Text style={styles.sub}>Étage {s.floor} · {biomeName(s.floor)}</Text>
        </View>
        <View style={styles.floorBadge}><Text style={styles.floorNum}>{s.floor}</Text><Text style={styles.floorLbl}>étage</Text></View>
      </View>

      <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
        <Card style={{ alignItems: 'center' }}>
          <View style={styles.floatLayer} pointerEvents="none">
            {fx.map((f) => <FxNode key={f.id} fx={f} onDone={remove} />)}
            {levelToast !== null && <LevelToast level={levelToast} />}
          </View>
          <Pressable onPress={onTap} hitSlop={20}>
            <Animated.Text style={[styles.mob, { transform: [{ scale: hitAnim }, { translateY: bob }] }]}>{mobEmoji(s.floor, s.monsterIndex)}</Animated.Text>
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
      </Animated.View>

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
          <Pressable key={cp.id} onPress={() => doBuy(cp.id, amt)} style={[styles.buy, { borderColor: can ? colors.gold : colors.border, opacity: can ? 1 : 0.65 }]}>
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

function FxNode({ fx, onDone }: { fx: Fx; onDone: (id: number) => void }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dur = fx.kind === 'float' ? 800 : fx.kind === 'coin' ? 620 : fx.kind === 'ghost' ? 460 : fx.kind === 'ring' ? 420 : 500;
    Animated.timing(p, { toValue: 1, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => onDone(fx.id));
  }, []);
  const opacity = p.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });

  if (fx.kind === 'float') {
    const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });
    return <Animated.Text style={{ position: 'absolute', left: `${fx.x}%`, top: 20, color: fx.color, fontWeight: '900', fontSize: fx.crit ? 26 : 16, opacity, transform: [{ translateY }] }}>{fx.text}</Animated.Text>;
  }
  if (fx.kind === 'particle') {
    const tx = p.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(fx.angle) * fx.dist] });
    const ty = p.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(fx.angle) * fx.dist] });
    return <Animated.View style={{ position: 'absolute', left: '50%', top: 44, width: fx.size, height: fx.size, borderRadius: fx.size, backgroundColor: fx.color, opacity, transform: [{ translateX: tx }, { translateY: ty }] }} />;
  }
  if (fx.kind === 'coin') {
    const ty = p.interpolate({ inputRange: [0, 1], outputRange: [0, -150] });
    const tx = p.interpolate({ inputRange: [0, 1], outputRange: [0, (Math.random() - 0.5) * 60] });
    return <Animated.Text style={{ position: 'absolute', left: '50%', top: 44, fontSize: 16, opacity, transform: [{ translateX: tx }, { translateY: ty }] }}>🪙</Animated.Text>;
  }
  if (fx.kind === 'ghost') {
    const scale = p.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
    const ty = p.interpolate({ inputRange: [0, 1], outputRange: [0, -40] });
    return <Animated.Text style={{ position: 'absolute', left: '50%', top: 0, marginLeft: -38, fontSize: 76, opacity, transform: [{ translateY: ty }, { scale }] }}>{fx.emoji}</Animated.Text>;
  }
  // ring
  const scale = p.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.6] });
  return <Animated.View style={{ position: 'absolute', left: '50%', top: 44, width: 24, height: 24, marginLeft: -12, marginTop: -12, borderRadius: 12, borderWidth: 3, borderColor: colors.xp, opacity, transform: [{ scale }] }} />;
}

function LevelToast({ level }: { level: number }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(p, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(); }, []);
  const opacity = p.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [10, -24] });
  return <Animated.Text style={{ position: 'absolute', left: 0, right: 0, top: 8, textAlign: 'center', color: colors.gold, fontSize: 24, fontWeight: '900', opacity, transform: [{ translateY }] }}>⭐ NIVEAU {level}</Animated.Text>;
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
  floatLayer: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 5 },
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
