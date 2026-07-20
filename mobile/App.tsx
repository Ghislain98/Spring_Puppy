import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform,
  AppState,
  AppStateStatus,
  Modal,
} from 'react-native';
import { colors, radius, font } from './src/theme';
import { useGame } from './src/game/store';
import { GAME } from './src/game/config';
import { OfflineResult } from './src/game/engine';
import TodayScreen from './src/screens/TodayScreen';
import DungeonScreen from './src/screens/DungeonScreen';
import HeroScreen from './src/screens/HeroScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { scheduleDailyReminder } from './src/game/notifications';

type TabKey = 'today' | 'dungeon' | 'hero' | 'settings';

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'today', label: 'Aujourd’hui', emoji: '📅' },
  { key: 'dungeon', label: 'Donjon', emoji: '🏰' },
  { key: 'hero', label: 'Héros', emoji: '🦸' },
  { key: 'settings', label: 'Réglages', emoji: '⚙️' },
];

export default function App() {
  const [tab, setTab] = useState<TabKey>('today');
  const [offline, setOffline] = useState<OfflineResult | null>(null);

  const init = useGame((s) => s.init);
  const tick = useGame((s) => s.tick);

  // Démarrage : reset quotidien + gains hors-ligne + re-programmation du rappel.
  useEffect(() => {
    const res = init();
    if (res && (res.gold > 0 || res.xp > 0)) setOffline(res);
    const { notificationsEnabled, reminderHour } = useGame.getState();
    if (notificationsEnabled) scheduleDailyReminder(reminderHour);
  }, [init]);

  // Boucle de combat idle (app au premier plan).
  useEffect(() => {
    const id = setInterval(() => tick(), GAME.TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  // Retour au premier plan -> recalcul des gains hors-ligne.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        const res = init();
        if (res && (res.gold > 0 || res.xp > 0)) setOffline(res);
      }
    });
    return () => sub.remove();
  }, [init]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.brandBar}>
        <Text style={styles.brand}>
          ⚔️ Habit<Text style={{ color: colors.gold }}>Quest</Text>
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'today' && <TodayScreen />}
        {tab === 'dungeon' && <DungeonScreen />}
        {tab === 'hero' && <HeroScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>

      {/* Barre d'onglets */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabEmoji, { opacity: active ? 1 : 0.5 }]}>{t.emoji}</Text>
              <Text style={[styles.tabLabel, { color: active ? colors.gold : colors.textFaint }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Gains hors-ligne */}
      <Modal visible={offline !== null} transparent animationType="fade" onRequestClose={() => setOffline(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.offlineCard}>
            <Text style={styles.offlineEmoji}>🌙</Text>
            <Text style={styles.offlineTitle}>Pendant ton absence</Text>
            <Text style={styles.offlineSub}>Ton héros a continué de fouiller le donjon.</Text>
            <View style={styles.offlineRow}>
              <View style={styles.offlineStat}>
                <Text style={[styles.offlineVal, { color: colors.gold }]}>+{offline?.gold ?? 0}</Text>
                <Text style={styles.offlineLbl}>or</Text>
              </View>
              <View style={styles.offlineStat}>
                <Text style={[styles.offlineVal, { color: colors.xp }]}>+{offline?.xp ?? 0}</Text>
                <Text style={styles.offlineLbl}>XP</Text>
              </View>
            </View>
            <Pressable style={styles.offlineBtn} onPress={() => setOffline(null)}>
              <Text style={styles.offlineBtnText}>Récupérer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  brandBar: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { color: colors.text, fontSize: font.h3, fontWeight: '900', letterSpacing: 0.5 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgElevated,
    paddingBottom: Platform.OS === 'ios' ? 18 : 8,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: font.tiny, fontWeight: '700', marginTop: 2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  offlineCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  offlineEmoji: { fontSize: 44 },
  offlineTitle: { color: colors.text, fontSize: font.h2, fontWeight: '900', marginTop: 8 },
  offlineSub: { color: colors.textMuted, fontSize: font.small, marginTop: 4, textAlign: 'center' },
  offlineRow: { flexDirection: 'row', gap: 40, marginVertical: 20 },
  offlineStat: { alignItems: 'center' },
  offlineVal: { fontSize: font.h1, fontWeight: '900' },
  offlineLbl: { color: colors.textFaint, fontSize: font.small },
  offlineBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  offlineBtnText: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
});
