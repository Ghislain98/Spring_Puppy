import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card, SectionTitle, Chip } from '../components/ui';
import { CATEGORIES, categoryMeta, presetsByCategory } from '../game/config';
import { Category } from '../game/types';
import { useGame } from '../game/store';

export default function TodayScreen() {
  const todayLog = useGame((s) => s.todayLog);
  const streak = useGame((s) => s.streak);
  const level = useGame((s) => s.level);
  const floor = useGame((s) => s.floor);
  const logHabit = useGame((s) => s.logHabit);

  const [openCat, setOpenCat] = useState<Category | null>(null);

  // Toast de récompense animé.
  const [toast, setToast] = useState<string | null>(null);
  const toastY = useRef(new Animated.Value(0)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (text: string) => {
    setToast(text);
    toastY.setValue(20);
    toastOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(toastY, { toValue: -10, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 500, delay: 700, useNativeDriver: true }).start();
    });
  };

  const onPick = (presetId: string) => {
    const entry = logHabit(presetId);
    setOpenCat(null);
    if (entry) showToast(`${entry.emoji}  +${entry.xp} XP · +${entry.gold} or`);
  };

  const todayXp = useMemo(() => todayLog.reduce((a, h) => a + h.xp, 0), [todayLog]);
  const todayGold = useMemo(() => todayLog.reduce((a, h) => a + h.gold, 0), [todayLog]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Aujourd'hui</Text>
            <Text style={styles.sub}>Héros niv. {level} · Donjon étage {floor}</Text>
          </View>
          <View style={styles.streak}>
            <Text style={{ fontSize: 20 }}>🔥</Text>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLbl}>jours</Text>
          </View>
        </View>

        {/* Prompt principal */}
        <Card style={{ marginBottom: spacing(4) }}>
          <Text style={styles.promptTitle}>Que veux-tu ajouter ?</Text>
          <Text style={styles.promptSub}>
            Chaque bonne habitude te rapporte de l'XP et de l'or, et renforce ton héros dans le donjon.
          </Text>
          <View style={styles.catRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => setOpenCat(c.key)}
                style={({ pressed }) => [
                  styles.catBtn,
                  { borderColor: c.color, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text style={[styles.catLabel, { color: c.color }]}>{c.label}</Text>
                <Text style={styles.catBoost}>+{c.boostLabel}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Récap du jour */}
        <SectionTitle>Bilan du jour</SectionTitle>
        <Card style={{ marginBottom: spacing(4) }}>
          <View style={styles.summaryRow}>
            <Summary value={String(todayLog.length)} label="habitudes" color={colors.text} />
            <Summary value={`+${todayXp}`} label="XP" color={colors.xp} />
            <Summary value={`+${todayGold}`} label="or" color={colors.gold} />
          </View>
        </Card>

        {/* Journal du jour */}
        <SectionTitle>Journal</SectionTitle>
        {todayLog.length === 0 ? (
          <Card>
            <Text style={styles.empty}>
              Rien pour l'instant. Ajoute ta première habitude healthy pour lancer ton héros ! 🗡️
            </Text>
          </Card>
        ) : (
          todayLog.map((h, i) => {
            const meta = categoryMeta(h.category);
            return (
              <Card key={`${h.ts}-${i}`} style={styles.logCard}>
                <Text style={styles.logEmoji}>{h.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logLabel}>{h.label}</Text>
                  <Chip label={meta.label} color={meta.color} bg={colors.bgElevated} />
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.xp, fontWeight: '700', fontSize: font.small }}>+{h.xp} XP</Text>
                  <Text style={{ color: colors.gold, fontWeight: '700', fontSize: font.small }}>+{h.gold} or</Text>
                </View>
              </Card>
            );
          })
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Toast récompense */}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { opacity: toastOpacity, transform: [{ translateY: toastY }] }]}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}

      {/* Modale de sélection d'habitude */}
      <Modal visible={openCat !== null} transparent animationType="slide" onRequestClose={() => setOpenCat(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpenCat(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {openCat && <PresetPicker category={openCat} onPick={onPick} />}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function PresetPicker({ category, onPick }: { category: Category; onPick: (id: string) => void }) {
  const meta = categoryMeta(category);
  const presets = presetsByCategory(category);
  return (
    <View>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHead}>
        <Text style={styles.sheetTitle}>
          {meta.emoji}  {meta.label}
        </Text>
        <Text style={styles.sheetSub}>{meta.tagline}</Text>
      </View>
      <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
        {presets.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => onPick(p.id)}
            style={({ pressed }) => [styles.presetRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={styles.presetEmoji}>{p.emoji}</Text>
            <Text style={styles.presetLabel}>{p.label}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.xp, fontSize: font.tiny, fontWeight: '700' }}>+{p.xp} XP</Text>
              <Text style={{ color: colors.gold, fontSize: font.tiny, fontWeight: '700' }}>+{p.gold} or</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function Summary({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color, fontSize: font.h2, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: 2 }}>{label}</Text>
    </View>
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
  hello: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  streak: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  streakNum: { color: colors.gold, fontSize: font.h3, fontWeight: '900', lineHeight: 20 },
  streakLbl: { color: colors.textFaint, fontSize: font.tiny },
  promptTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800' },
  promptSub: { color: colors.textMuted, fontSize: font.small, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  catRow: { flexDirection: 'row', gap: 10 },
  catBtn: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingVertical: 16,
    alignItems: 'center',
  },
  catEmoji: { fontSize: 30 },
  catLabel: { fontWeight: '800', fontSize: font.small, marginTop: 6 },
  catBoost: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },
  summaryRow: { flexDirection: 'row' },
  empty: { color: colors.textMuted, fontSize: font.body, lineHeight: 22, textAlign: 'center', paddingVertical: 10 },
  logCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingVertical: 12 },
  logEmoji: { fontSize: 26, marginRight: 12 },
  logLabel: { color: colors.text, fontSize: font.body, fontWeight: '700', marginBottom: 4 },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 40,
    backgroundColor: colors.gold,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  toastText: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 16,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHead: { marginBottom: 12 },
  sheetTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800' },
  sheetSub: { color: colors.textMuted, fontSize: font.small, marginTop: 4 },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetEmoji: { fontSize: 24, marginRight: 12 },
  presetLabel: { flex: 1, color: colors.text, fontSize: font.body, fontWeight: '600' },
});
