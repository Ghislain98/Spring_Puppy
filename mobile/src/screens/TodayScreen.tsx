import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card } from '../components/ui';
import { CATEGORIES, categoryMeta, CHECKIN_ORDER, checkItemsByCategory, CheckItem } from '../game/config';
import { Category, ClaimEntry, HabitPreset } from '../game/types';
import { useGame, dayKey } from '../game/store';

// Transforme une habitude perso en item de check-in (interrupteur).
function customToItem(h: HabitPreset): CheckItem {
  return {
    id: h.id,
    category: h.category,
    label: h.label,
    emoji: h.emoji,
    stat: h.stat,
    kind: 'toggle',
    reward: { xp: h.xp, gold: h.gold, statGain: h.statGain },
  };
}

type Answers = Record<string, string | boolean>;

export default function TodayScreen({ onGoDungeon }: { onGoDungeon?: () => void }) {
  const lastCheckinDate = useGame((s) => s.lastCheckinDate);
  const claimCheckin = useGame((s) => s.claimCheckin);
  const customHabits = useGame((s) => s.customHabits);
  const streak = useGame((s) => s.streak);
  const level = useGame((s) => s.level);
  const floor = useGame((s) => s.floor);
  const todayLog = useGame((s) => s.todayLog);

  const today = dayKey();
  const alreadyDone = lastCheckinDate === today;

  const [step, setStep] = useState(0); // 0..2 = catégories, 3 = récap
  const [answers, setAnswers] = useState<Answers>({});
  const [celebrate, setCelebrate] = useState<{ xp: number; gold: number } | null>(null);

  const itemsFor = (cat: Category): CheckItem[] => [
    ...checkItemsByCategory(cat),
    ...customHabits.filter((h) => h.category === cat).map(customToItem),
  ];

  const allItems = useMemo(
    () => CHECKIN_ORDER.flatMap(itemsFor),
    [customHabits],
  );

  const entries: ClaimEntry[] = useMemo(() => {
    const out: ClaimEntry[] = [];
    for (const item of allItems) {
      const a = answers[item.id];
      if (item.kind === 'toggle') {
        if (a === true && item.reward && item.reward.xp > 0) {
          out.push({ category: item.category, label: item.label, emoji: item.emoji, stat: item.stat, ...item.reward });
        }
      } else if (item.options) {
        const opt = item.options.find((o) => o.id === a);
        if (opt && (opt.xp > 0 || opt.gold > 0 || opt.statGain > 0)) {
          out.push({
            category: item.category,
            label: `${item.label} ${opt.label}`,
            emoji: item.emoji,
            stat: item.stat,
            xp: opt.xp,
            gold: opt.gold,
            statGain: opt.statGain,
          });
        }
      }
    }
    return out;
  }, [answers, allItems]);

  const totalXp = entries.reduce((a, e) => a + e.xp, 0);
  const totalGold = entries.reduce((a, e) => a + e.gold, 0);

  const claim = () => {
    if (claimCheckin(entries)) setCelebrate({ xp: totalXp, gold: totalGold });
  };

  // ----- Écran de célébration (récompenses encaissées) -----
  if (celebrate) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 68 }}>⚔️</Text>
        <Text style={styles.celebTitle}>Récompenses encaissées !</Text>
        <View style={styles.celebRow}>
          <View style={styles.celebStat}>
            <Text style={[styles.celebVal, { color: colors.xp }]}>+{celebrate.xp}</Text>
            <Text style={styles.celebLbl}>XP</Text>
          </View>
          <View style={styles.celebStat}>
            <Text style={[styles.celebVal, { color: colors.gold }]}>+{celebrate.gold}</Text>
            <Text style={styles.celebLbl}>or</Text>
          </View>
          <View style={styles.celebStat}>
            <Text style={[styles.celebVal, { color: colors.sport }]}>🔥{streak}</Text>
            <Text style={styles.celebLbl}>streak</Text>
          </View>
        </View>
        <Text style={styles.celebSub}>Ton héros est renforcé. À l'aventure !</Text>
        <Pressable style={styles.primaryBtn} onPress={() => onGoDungeon?.()}>
          <Text style={styles.primaryBtnText}>Partir au donjon ⚔️</Text>
        </Pressable>
        <Pressable onPress={() => setCelebrate(null)} style={{ marginTop: 14 }}>
          <Text style={styles.linkText}>Rester ici</Text>
        </Pressable>
      </View>
    );
  }

  // ----- Check-in déjà validé aujourd'hui -----
  if (alreadyDone) {
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header level={level} floor={floor} streak={streak} />
        <Card style={{ alignItems: 'center', marginBottom: spacing(4) }}>
          <Text style={{ fontSize: 44 }}>✅</Text>
          <Text style={styles.doneTitle}>Check-in du jour terminé</Text>
          <Text style={styles.doneSub}>Reviens demain pour renforcer encore ton héros.</Text>
          <Pressable style={[styles.primaryBtn, { marginTop: 18 }]} onPress={() => onGoDungeon?.()}>
            <Text style={styles.primaryBtnText}>Aller au donjon ⚔️</Text>
          </Pressable>
        </Card>

        <Text style={styles.section}>Récolté aujourd'hui</Text>
        {todayLog.map((h, i) => (
          <View key={`${h.ts}-${i}`} style={styles.recapRow}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>{h.emoji}</Text>
            <Text style={styles.recapLabel}>{h.label}</Text>
            <Text style={{ color: colors.xp, fontWeight: '700', fontSize: font.small, marginRight: 10 }}>+{h.xp}</Text>
            <Text style={{ color: colors.gold, fontWeight: '700', fontSize: font.small }}>+{h.gold}</Text>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    );
  }

  // ----- Assistant de check-in -----
  const isSummary = step >= CHECKIN_ORDER.length;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header level={level} floor={floor} streak={streak} />

        {/* Progression des étapes */}
        <View style={styles.dots}>
          {[...CHECKIN_ORDER, 'recap'].map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]}
            />
          ))}
        </View>

        {!isSummary ? (
          <CategoryStep
            category={CHECKIN_ORDER[step]}
            items={itemsFor(CHECKIN_ORDER[step])}
            answers={answers}
            setAnswers={setAnswers}
          />
        ) : (
          <SummaryStep entries={entries} totalXp={totalXp} totalGold={totalGold} />
        )}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Barre de navigation fixe */}
      <View style={styles.navBar}>
        {step > 0 ? (
          <Pressable style={styles.navBack} onPress={() => setStep(step - 1)}>
            <Text style={styles.navBackText}>Précédent</Text>
          </Pressable>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {!isSummary ? (
          <Pressable style={styles.navNext} onPress={() => setStep(step + 1)}>
            <Text style={styles.navNextText}>
              {step === CHECKIN_ORDER.length - 1 ? 'Mes récompenses →' : 'Suivant →'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.navNext, entries.length === 0 && { opacity: 0.4 }]}
            onPress={claim}
            disabled={entries.length === 0}
          >
            <Text style={styles.navNextText}>Récupérer ⚔️</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Header({ level, floor, streak }: { level: number; floor: number; streak: number }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.hello}>Check-in du jour</Text>
        <Text style={styles.sub}>Héros niv. {level} · Donjon étage {floor}</Text>
      </View>
      <View style={styles.streak}>
        <Text style={{ fontSize: 18 }}>🔥</Text>
        <Text style={styles.streakNum}>{streak}</Text>
      </View>
    </View>
  );
}

function CategoryStep({
  category,
  items,
  answers,
  setAnswers,
}: {
  category: Category;
  items: CheckItem[];
  answers: Answers;
  setAnswers: (a: Answers) => void;
}) {
  const meta = categoryMeta(category);
  return (
    <View>
      <View style={[styles.catBanner, { borderColor: meta.color }]}>
        <Text style={{ fontSize: 34 }}>{meta.emoji}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.catTitle, { color: meta.color }]}>{meta.label}</Text>
          <Text style={styles.catTagline}>{meta.tagline}</Text>
        </View>
      </View>

      {items.map((item) => (
        <Card key={item.id} style={{ marginBottom: 10 }}>
          <View style={styles.itemHead}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>{item.emoji}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </View>

          {item.kind === 'toggle' ? (
            <Pressable
              onPress={() => setAnswers({ ...answers, [item.id]: !answers[item.id] })}
              style={[
                styles.toggle,
                answers[item.id] === true && { backgroundColor: meta.color, borderColor: meta.color },
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  answers[item.id] === true && { color: '#0e0b1a' },
                ]}
              >
                {answers[item.id] === true ? '✓ Fait' : 'À cocher'}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.optRow}>
              {item.options!.map((opt) => {
                const active = answers[item.id] === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setAnswers({ ...answers, [item.id]: opt.id })}
                    style={[styles.opt, active && { backgroundColor: meta.color, borderColor: meta.color }]}
                  >
                    <Text style={[styles.optText, active && { color: '#0e0b1a', fontWeight: '900' }]}>{opt.label}</Text>
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

function SummaryStep({ entries, totalXp, totalGold }: { entries: ClaimEntry[]; totalXp: number; totalGold: number }) {
  return (
    <View>
      <Text style={styles.summaryTitle}>Tes récompenses</Text>
      <Card style={{ marginBottom: spacing(4) }}>
        <View style={styles.summaryTotals}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[styles.summaryVal, { color: colors.xp }]}>+{totalXp}</Text>
            <Text style={styles.summaryLbl}>XP</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[styles.summaryVal, { color: colors.gold }]}>+{totalGold}</Text>
            <Text style={styles.summaryLbl}>or</Text>
          </View>
        </View>
      </Card>

      {entries.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            Tu n'as rien coché. Reviens en arrière et sélectionne au moins une action healthy pour récupérer des
            récompenses. 💪
          </Text>
        </Card>
      ) : (
        entries.map((e, i) => {
          const meta = categoryMeta(e.category);
          return (
            <View key={i} style={styles.recapRow}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>{e.emoji}</Text>
              <Text style={styles.recapLabel}>{e.label}</Text>
              <Text style={{ color: meta.color, fontWeight: '700', fontSize: font.tiny, marginRight: 10 }}>
                +{e.statGain}
              </Text>
              <Text style={{ color: colors.xp, fontWeight: '700', fontSize: font.small, marginRight: 8 }}>+{e.xp}</Text>
              <Text style={{ color: colors.gold, fontWeight: '700', fontSize: font.small }}>+{e.gold}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(3),
  },
  hello: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakNum: { color: colors.gold, fontSize: font.h3, fontWeight: '900' },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: spacing(4) },
  dot: { width: 26, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.gold },
  dotDone: { backgroundColor: colors.success },
  catBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: spacing(4),
  },
  catTitle: { fontSize: font.h2, fontWeight: '900' },
  catTagline: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  itemHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemLabel: { color: colors.text, fontSize: font.body, fontWeight: '700', flex: 1 },
  toggle: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  toggleText: { color: colors.textMuted, fontWeight: '800', fontSize: font.body },
  optRow: { flexDirection: 'row', gap: 8 },
  opt: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  optText: { color: colors.textMuted, fontWeight: '700', fontSize: font.small },
  navBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  navBackText: { color: colors.textMuted, fontWeight: '800', fontSize: font.body },
  navNext: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  navNextText: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
  summaryTitle: { color: colors.text, fontSize: font.h2, fontWeight: '900', marginBottom: 12 },
  summaryTotals: { flexDirection: 'row' },
  summaryVal: { fontSize: font.h1, fontWeight: '900' },
  summaryLbl: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  emptyText: { color: colors.textMuted, fontSize: font.body, lineHeight: 22, textAlign: 'center' },
  section: { color: colors.textMuted, fontSize: font.small, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  recapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  recapLabel: { flex: 1, color: colors.text, fontSize: font.small, fontWeight: '600' },
  doneTitle: { color: colors.text, fontSize: font.h2, fontWeight: '900', marginTop: 8 },
  doneSub: { color: colors.textMuted, fontSize: font.small, marginTop: 4, textAlign: 'center' },
  celebTitle: { color: colors.text, fontSize: font.h1, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  celebRow: { flexDirection: 'row', gap: 28, marginVertical: 24 },
  celebStat: { alignItems: 'center' },
  celebVal: { fontSize: font.h1, fontWeight: '900' },
  celebLbl: { color: colors.textFaint, fontSize: font.small },
  celebSub: { color: colors.textMuted, fontSize: font.body, marginBottom: 24, textAlign: 'center' },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 40, paddingVertical: 15 },
  primaryBtnText: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
  linkText: { color: colors.textMuted, fontSize: font.small, textDecorationLine: 'underline' },
});
