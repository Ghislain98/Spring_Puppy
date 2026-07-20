import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card, SectionTitle } from '../components/ui';
import { useGame } from '../game/store';
import { CATEGORIES, categoryMeta, INTENSITIES, intensity, EMOJI_CHOICES, Intensity } from '../game/config';
import { Category } from '../game/types';
import { scheduleDailyReminder, cancelDailyReminder } from '../game/notifications';

export default function SettingsScreen() {
  const dailyGoal = useGame((s) => s.dailyGoal);
  const setDailyGoal = useGame((s) => s.setDailyGoal);
  const notificationsEnabled = useGame((s) => s.notificationsEnabled);
  const reminderHour = useGame((s) => s.reminderHour);
  const setNotifications = useGame((s) => s.setNotifications);
  const customHabits = useGame((s) => s.customHabits);
  const removeCustomHabit = useGame((s) => s.removeCustomHabit);
  const resetGame = useGame((s) => s.resetGame);

  const [showForm, setShowForm] = useState(false);

  const toggleNotifications = async (value: boolean) => {
    if (value) {
      const ok = await scheduleDailyReminder(reminderHour);
      if (!ok) {
        Alert.alert(
          'Notifications refusées',
          "Autorise les notifications dans les réglages du téléphone pour activer le rappel quotidien.",
        );
        return;
      }
      setNotifications(true, reminderHour);
    } else {
      await cancelDailyReminder();
      setNotifications(false, reminderHour);
    }
  };

  const changeHour = async (delta: number) => {
    const h = (reminderHour + delta + 24) % 24;
    setNotifications(notificationsEnabled, h);
    if (notificationsEnabled) await scheduleDailyReminder(h);
  };

  const confirmReset = () => {
    Alert.alert('Recommencer ?', 'Cela efface toute ta progression. Action irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Tout effacer', style: 'destructive', onPress: () => resetGame() },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Réglages</Text>
        <Text style={styles.subtitle}>Tout ici est optionnel — l'app fonctionne très bien sans y toucher.</Text>

        {/* Objectif quotidien */}
        <SectionTitle style={{ marginTop: spacing(4) }}>Objectif quotidien</SectionTitle>
        <Card style={{ marginBottom: spacing(4) }}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{dailyGoal === 0 ? 'Désactivé' : `${dailyGoal} habitudes / jour`}</Text>
              <Text style={styles.rowSub}>Un petit objectif pour garder le rythme, sans pression.</Text>
            </View>
            <Stepper value={dailyGoal} onDec={() => setDailyGoal(dailyGoal - 1)} onInc={() => setDailyGoal(dailyGoal + 1)} />
          </View>
        </Card>

        {/* Notifications */}
        <SectionTitle>Rappel quotidien</SectionTitle>
        <Card style={{ marginBottom: spacing(4) }}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSub}>Un rappel doux pour renforcer ton héros.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.gold, false: colors.border }}
              thumbColor={colors.text}
            />
          </View>
          {notificationsEnabled && (
            <View style={[styles.row, { marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }]}>
              <Text style={styles.rowTitle}>Heure du rappel</Text>
              <Stepper
                value={reminderHour}
                display={`${String(reminderHour).padStart(2, '0')}h`}
                onDec={() => changeHour(-1)}
                onInc={() => changeHour(1)}
              />
            </View>
          )}
        </Card>

        {/* Habitudes personnalisées */}
        <SectionTitle>Habitudes personnalisées</SectionTitle>
        <Card style={{ marginBottom: spacing(4) }}>
          {customHabits.length === 0 ? (
            <Text style={styles.rowSub}>
              Ajoute tes propres habitudes healthy. Elles apparaîtront dans le prompt d'ajout, à côté des habitudes
              par défaut.
            </Text>
          ) : (
            customHabits.map((h) => {
              const meta = categoryMeta(h.category);
              return (
                <View key={h.id} style={styles.customRow}>
                  <Text style={{ fontSize: 22, marginRight: 10 }}>{h.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{h.label}</Text>
                    <Text style={[styles.rowSub, { color: meta.color }]}>
                      {meta.label} · +{h.xp} XP · +{h.gold} or
                    </Text>
                  </View>
                  <Pressable onPress={() => removeCustomHabit(h.id)} hitSlop={10}>
                    <Text style={{ color: colors.danger, fontSize: 20 }}>✕</Text>
                  </Pressable>
                </View>
              );
            })
          )}
          <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.addBtnText}>＋ Créer une habitude</Text>
          </Pressable>
        </Card>

        {/* Zone danger */}
        <SectionTitle>Données</SectionTitle>
        <Pressable onPress={confirmReset} style={styles.reset}>
          <Text style={styles.resetText}>Réinitialiser la progression</Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowForm(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <CustomHabitForm onClose={() => setShowForm(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function CustomHabitForm({ onClose }: { onClose: () => void }) {
  const addCustomHabit = useGame((s) => s.addCustomHabit);
  const [label, setLabel] = useState('');
  const [cat, setCat] = useState<Category>('sport');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [inten, setInten] = useState<Intensity>('moyen');

  const submit = () => {
    const name = label.trim();
    if (!name) return;
    const tier = intensity(inten);
    addCustomHabit({
      category: cat,
      label: name,
      emoji,
      xp: tier.xp,
      gold: tier.gold,
      stat: categoryMeta(cat).boosts,
      statGain: tier.statGain,
    });
    onClose();
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sheetHandle} />
      <Text style={styles.sheetTitle}>Nouvelle habitude</Text>

      <Text style={styles.formLabel}>Nom</Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Ex. Méditation 10 min"
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />

      <Text style={styles.formLabel}>Catégorie</Text>
      <View style={styles.pickRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.key}
            onPress={() => setCat(c.key)}
            style={[styles.pick, cat === c.key && { borderColor: c.color, backgroundColor: colors.cardAlt }]}
          >
            <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
            <Text style={[styles.pickLabel, cat === c.key && { color: c.color }]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.formLabel}>Icône</Text>
      <View style={styles.emojiWrap}>
        {EMOJI_CHOICES.map((e) => (
          <Pressable
            key={e}
            onPress={() => setEmoji(e)}
            style={[styles.emojiPick, emoji === e && { borderColor: colors.gold, backgroundColor: colors.cardAlt }]}
          >
            <Text style={{ fontSize: 20 }}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.formLabel}>Difficulté (récompense)</Text>
      <View style={styles.pickRow}>
        {INTENSITIES.map((it) => (
          <Pressable
            key={it.key}
            onPress={() => setInten(it.key)}
            style={[styles.pick, inten === it.key && { borderColor: colors.gold, backgroundColor: colors.cardAlt }]}
          >
            <Text style={[styles.pickLabel, inten === it.key && { color: colors.gold }]}>{it.label}</Text>
            <Text style={styles.pickSub}>+{it.xp} XP</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.submit, !label.trim() && { opacity: 0.4 }]} onPress={submit} disabled={!label.trim()}>
        <Text style={styles.submitText}>Créer</Text>
      </Pressable>
      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

function Stepper({
  value,
  display,
  onDec,
  onInc,
}: {
  value: number;
  display?: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onDec} style={styles.stepBtn} hitSlop={8}>
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={styles.stepVal}>{display ?? value}</Text>
      <Pressable onPress={onInc} style={styles.stepBtn} hitSlop={8}>
        <Text style={styles.stepBtnText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 8 },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: font.small, marginTop: 4, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  rowSub: { color: colors.textMuted, fontSize: font.small, marginTop: 3, lineHeight: 18 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  stepBtnText: { color: colors.gold, fontSize: font.h3, fontWeight: '900' },
  stepVal: { color: colors.text, fontSize: font.body, fontWeight: '800', minWidth: 40, textAlign: 'center' },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 12, backgroundColor: colors.bgElevated, borderRadius: radius.md },
  addBtnText: { color: colors.gold, fontWeight: '800', fontSize: font.body },
  reset: { alignItems: 'center', paddingVertical: 14 },
  resetText: { color: colors.textFaint, fontSize: font.small, textDecorationLine: 'underline' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: 16,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '88%',
  },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: 8 },
  formLabel: { color: colors.textMuted, fontSize: font.small, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: font.body,
  },
  pickRow: { flexDirection: 'row', gap: 8 },
  pick: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 12,
  },
  pickLabel: { color: colors.textMuted, fontSize: font.small, fontWeight: '700', marginTop: 4 },
  pickSub: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },
  emojiWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiPick: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  submit: { marginTop: 24, backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
  submitText: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
});
