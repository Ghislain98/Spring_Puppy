import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card } from '../components/ui';
import { CATEGORIES, CHECKIN_ORDER, checkItemsByCategory } from '../game/config';
import { Category, ClaimEntry } from '../game/types';
import { useGame, dayKey } from '../game/store';
import { haptics } from '../game/fx';

type Answers = Record<string, string | boolean>;

export default function TodayScreen({ onGoDungeon }: { onGoDungeon?: () => void }) {
  const lastCheckinDate = useGame((s) => s.lastCheckinDate);
  const claimCheckin = useGame((s) => s.claimCheckin);
  const streak = useGame((s) => s.streak);
  const level = useGame((s) => s.level);
  const floor = useGame((s) => s.floor);
  const todayLog = useGame((s) => s.todayLog);

  const today = dayKey();
  const done = lastCheckinDate === today;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [celebrate, setCelebrate] = useState<{ xp: number; gold: number; gems: number } | null>(null);

  const entries: ClaimEntry[] = useMemo(() => {
    const out: ClaimEntry[] = [];
    for (const cat of CHECKIN_ORDER) {
      for (const item of checkItemsByCategory(cat)) {
        const a = answers[item.id];
        if (item.kind === 'toggle') {
          if (a === true && item.reward && item.reward.xp > 0) {
            out.push({ category: item.category, label: item.label, emoji: item.emoji, stat: item.stat, ...item.reward });
          }
        } else if (item.options) {
          const opt = item.options.find((o) => o.id === a);
          if (opt && (opt.xp > 0 || opt.gold > 0)) {
            out.push({ category: item.category, label: `${item.label} ${opt.label}`, emoji: item.emoji, stat: item.stat, xp: opt.xp, gold: opt.gold, statGain: opt.statGain });
          }
        }
      }
    }
    return out;
  }, [answers]);

  const totalXp = entries.reduce((a, e) => a + e.xp, 0);
  const totalGold = entries.reduce((a, e) => a + e.gold, 0);

  const claim = () => {
    const r = claimCheckin(entries);
    if (r) { setCelebrate({ xp: r.xp, gold: r.gold, gems: r.gems }); haptics.level(); }
  };

  if (celebrate) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 64 }}>⚔️</Text>
        <Text style={styles.celebTitle}>Récompenses encaissées !</Text>
        <View style={styles.celebRow}>
          <View style={styles.cs}><Text style={[styles.cv, { color: colors.xp }]}>+{celebrate.xp}</Text><Text style={styles.cl}>XP</Text></View>
          <View style={styles.cs}><Text style={[styles.cv, { color: colors.gold }]}>+{celebrate.gold}</Text><Text style={styles.cl}>or</Text></View>
          <View style={styles.cs}><Text style={[styles.cv, { color: colors.gem }]}>+{celebrate.gems}</Text><Text style={styles.cl}>💎</Text></View>
        </View>
        <Text style={styles.sub}>Bénédiction du jour : ×1,5 or & dégâts pendant 24h. 🔥 Streak {streak}</Text>
        <Pressable style={styles.primary} onPress={() => onGoDungeon?.()}><Text style={styles.primaryTxt}>Partir au donjon ⚔️</Text></Pressable>
        <Pressable onPress={() => setCelebrate(null)} style={{ marginTop: 12 }}><Text style={styles.link}>Rester ici</Text></Pressable>
      </View>
    );
  }

  if (done) {
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header level={level} floor={floor} streak={streak} />
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 44 }}>✅</Text>
          <Text style={styles.doneTitle}>Check-in du jour terminé</Text>
          <Text style={styles.sub}>Bénédiction active : ×1,5 or & dégâts.</Text>
          <Pressable style={[styles.primary, { marginTop: 16 }]} onPress={() => onGoDungeon?.()}><Text style={styles.primaryTxt}>Aller au donjon ⚔️</Text></Pressable>
        </Card>
        <Text style={styles.section}>Récolté aujourd'hui</Text>
        {todayLog.map((h, i) => (
          <View key={i} style={styles.recap}><Text style={{ fontSize: 20, marginRight: 8 }}>{h.emoji}</Text><Text style={styles.recapLbl}>{h.label}</Text><Text style={{ color: colors.xp, fontWeight: '700', fontSize: font.small, marginRight: 8 }}>+{h.xp}</Text><Text style={{ color: colors.gold, fontWeight: '700', fontSize: font.small }}>+{h.gold}</Text></View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  }

  const isSummary = step >= CHECKIN_ORDER.length;
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header level={level} floor={floor} streak={streak} />
        <View style={styles.dots}>
          {[...CHECKIN_ORDER, 'r'].map((_, i) => <View key={i} style={[styles.dot, i === step && styles.dotAct, i < step && styles.dotDone]} />)}
        </View>
        {!isSummary ? (
          <CategoryStep category={CHECKIN_ORDER[step]} answers={answers} setAnswers={setAnswers} />
        ) : (
          <Summary entries={entries} totalXp={totalXp} totalGold={totalGold} />
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={styles.navBar}>
        {step > 0 ? <Pressable style={styles.back} onPress={() => setStep(step - 1)}><Text style={styles.backTxt}>Précédent</Text></Pressable> : <View style={{ flex: 1 }} />}
        {!isSummary ? (
          <Pressable style={styles.next} onPress={() => setStep(step + 1)}><Text style={styles.nextTxt}>{step === CHECKIN_ORDER.length - 1 ? 'Mes récompenses →' : 'Suivant →'}</Text></Pressable>
        ) : (
          <Pressable style={[styles.next, entries.length === 0 && { opacity: 0.4 }]} onPress={claim} disabled={entries.length === 0}><Text style={styles.nextTxt}>Récupérer ⚔️</Text></Pressable>
        )}
      </View>
    </View>
  );
}

function Header({ level, floor, streak }: { level: number; floor: number; streak: number }) {
  return (
    <View style={styles.header}>
      <View><Text style={styles.title}>Check-in du jour</Text><Text style={styles.sub}>Héros niv. {level} · Étage {floor}</Text></View>
      <View style={styles.streak}><Text style={{ fontSize: 18 }}>🔥</Text><Text style={styles.streakNum}>{streak}</Text></View>
    </View>
  );
}

function CategoryStep({ category, answers, setAnswers }: { category: Category; answers: Answers; setAnswers: (a: Answers) => void }) {
  const meta = CATEGORIES[category];
  return (
    <View>
      <View style={[styles.banner, { borderColor: meta.color }]}>
        <Text style={{ fontSize: 32 }}>{meta.emoji}</Text>
        <View style={{ flex: 1 }}><Text style={[styles.bannerT, { color: meta.color }]}>{meta.label}</Text><Text style={styles.sub}>{meta.tag}</Text></View>
      </View>
      {checkItemsByCategory(category).map((item) => (
        <Card key={item.id} style={{ marginBottom: 10 }}>
          <View style={styles.itemHead}><Text style={{ fontSize: 20, marginRight: 8 }}>{item.emoji}</Text><Text style={styles.itemLbl}>{item.label}</Text></View>
          {item.kind === 'toggle' ? (
            <Pressable onPress={() => setAnswers({ ...answers, [item.id]: !answers[item.id] })} style={[styles.toggle, answers[item.id] === true && { backgroundColor: meta.color, borderColor: meta.color }]}>
              <Text style={[styles.toggleTxt, answers[item.id] === true && { color: '#0e0b1a' }]}>{answers[item.id] === true ? '✓ Fait' : 'À cocher'}</Text>
            </Pressable>
          ) : (
            <View style={styles.opts}>
              {item.options!.map((opt) => {
                const active = answers[item.id] === opt.id;
                return (
                  <Pressable key={opt.id} onPress={() => setAnswers({ ...answers, [item.id]: opt.id })} style={[styles.opt, active && { backgroundColor: meta.color, borderColor: meta.color }]}>
                    <Text style={[styles.optTxt, active && { color: '#0e0b1a', fontWeight: '900' }]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>
      ))}
    </View>
  );
}

function Summary({ entries, totalXp, totalGold }: { entries: ClaimEntry[]; totalXp: number; totalGold: number }) {
  return (
    <View>
      <Text style={styles.summaryTitle}>Tes récompenses</Text>
      <Card>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, alignItems: 'center' }}><Text style={[styles.sv, { color: colors.xp }]}>+{totalXp}</Text><Text style={styles.slbl}>XP</Text></View>
          <View style={{ flex: 1, alignItems: 'center' }}><Text style={[styles.sv, { color: colors.gold }]}>+{totalGold}</Text><Text style={styles.slbl}>or</Text></View>
          <View style={{ flex: 1, alignItems: 'center' }}><Text style={[styles.sv, { color: colors.gem }]}>+3</Text><Text style={styles.slbl}>💎</Text></View>
        </View>
      </Card>
      {entries.length === 0 ? (
        <Card style={{ marginTop: 12 }}><Text style={[styles.sub, { textAlign: 'center' }]}>Rien de coché. Reviens en arrière et sélectionne au moins une action healthy 💪</Text></Card>
      ) : (
        <View style={{ marginTop: 12 }}>
          {entries.map((e, i) => (
            <View key={i} style={styles.recap}><Text style={{ fontSize: 20, marginRight: 8 }}>{e.emoji}</Text><Text style={styles.recapLbl}>{e.label}</Text><Text style={{ color: colors.xp, fontWeight: '700', fontSize: font.small, marginRight: 8 }}>+{e.xp}</Text><Text style={{ color: colors.gold, fontWeight: '700', fontSize: font.small }}>+{e.gold}</Text></View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 6 },
  streakNum: { color: colors.gold, fontSize: font.h3, fontWeight: '900' },
  dots: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginBottom: 16 },
  dot: { width: 24, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotAct: { backgroundColor: colors.gold },
  dotDone: { backgroundColor: colors.success },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1.5, padding: 15, marginBottom: 14 },
  bannerT: { fontSize: font.h2, fontWeight: '900' },
  itemHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  itemLbl: { color: colors.text, fontSize: font.body, fontWeight: '700', flex: 1 },
  toggle: { alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgElevated },
  toggleTxt: { color: colors.textMuted, fontWeight: '800', fontSize: font.body },
  opts: { flexDirection: 'row', gap: 7 },
  opt: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgElevated },
  optTxt: { color: colors.textMuted, fontWeight: '700', fontSize: font.small },
  navBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 12, padding: 14, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
  back: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border },
  backTxt: { color: colors.textMuted, fontWeight: '800', fontSize: font.body },
  next: { flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: radius.pill, backgroundColor: colors.gold },
  nextTxt: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
  summaryTitle: { color: colors.text, fontSize: font.h2, fontWeight: '900', marginBottom: 12 },
  sv: { fontSize: font.h1, fontWeight: '900' },
  slbl: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  recap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  recapLbl: { flex: 1, color: colors.text, fontSize: font.small, fontWeight: '600' },
  section: { color: colors.textMuted, fontSize: font.small, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing(4), marginBottom: 10 },
  doneTitle: { color: colors.text, fontSize: font.h2, fontWeight: '900', marginTop: 8 },
  celebTitle: { color: colors.text, fontSize: font.h1, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  celebRow: { flexDirection: 'row', gap: 26, marginVertical: 22 },
  cs: { alignItems: 'center' },
  cv: { fontSize: font.h1, fontWeight: '900' },
  cl: { color: colors.textFaint, fontSize: font.small },
  primary: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 40, paddingVertical: 15, marginTop: 8 },
  primaryTxt: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
  link: { color: colors.textMuted, fontSize: font.small, textDecorationLine: 'underline' },
});
