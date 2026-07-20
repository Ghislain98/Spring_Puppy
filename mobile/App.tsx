import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar, Platform, AppState, AppStateStatus, Modal, Animated, Easing } from 'react-native';
import { colors, radius, font } from './src/theme';
import { useGame } from './src/game/store';
import { GAME, CLASSES } from './src/game/config';
import { ACHIEVEMENTS } from './src/game/achievements';
import { OfflineResult, fmt } from './src/game/engine';
import { scheduleDailyReminder } from './src/game/notifications';
import CurrencyBar from './src/components/CurrencyBar';
import DungeonScreen from './src/screens/DungeonScreen';
import TodayScreen from './src/screens/TodayScreen';
import ObjectifScreen from './src/screens/ObjectifScreen';
import TalentsScreen from './src/screens/TalentsScreen';
import HeroScreen from './src/screens/HeroScreen';

type TabKey = 'dungeon' | 'today' | 'body' | 'talents' | 'hero';
const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'dungeon', label: 'Donjon', emoji: '🏰' },
  { key: 'today', label: 'Check-in', emoji: '✅' },
  { key: 'body', label: 'Objectif', emoji: '🎯' },
  { key: 'talents', label: 'Talents', emoji: '🌟' },
  { key: 'hero', label: 'Héros', emoji: '🦸' },
];

export default function App() {
  const [tab, setTab] = useState<TabKey>('dungeon');
  const [offline, setOffline] = useState<OfflineResult | null>(null);
  const cls = useGame((s) => s.cls);
  const setClass = useGame((s) => s.setClass);
  const init = useGame((s) => s.init);
  const tick = useGame((s) => s.tick);
  const checkAchievements = useGame((s) => s.checkAchievements);
  const unlockId = useGame((s) => s.unlockQueue[0]);
  const popUnlock = useGame((s) => s.popUnlock);

  useEffect(() => {
    const res = init();
    if (res && (res.gold > 0 || res.xp > 0)) setOffline(res);
    const st = useGame.getState();
    if (st.notificationsEnabled) scheduleDailyReminder(st.reminderHour);
  }, [init]);

  useEffect(() => {
    const id = setInterval(() => { tick(); checkAchievements(); }, GAME.TICK_MS);
    return () => clearInterval(id);
  }, [tick, checkAchievements]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (n: AppStateStatus) => {
      if (n === 'active') {
        const res = init();
        if (res && (res.gold > 0 || res.xp > 0)) setOffline(res);
      }
    });
    return () => sub.remove();
  }, [init]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={styles.brand}>
        <Text style={styles.brandTxt}>⚔️ Habit<Text style={{ color: colors.gold }}>Quest</Text> <Text style={styles.tag}>· fantasy</Text></Text>
      </View>
      <CurrencyBar />

      <View style={{ flex: 1 }}>
        {tab === 'dungeon' && <DungeonScreen />}
        {tab === 'today' && <TodayScreen onGoDungeon={() => setTab('dungeon')} />}
        {tab === 'body' && <ObjectifScreen />}
        {tab === 'talents' && <TalentsScreen />}
        {tab === 'hero' && <HeroScreen />}
      </View>

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

      {/* Toast de succès débloqué */}
      {unlockId && <AchievementToast key={unlockId} id={unlockId} onDone={popUnlock} />}

      {/* Choix de classe au premier lancement */}
      <Modal visible={!cls} transparent animationType="fade">
        <View style={styles.overlay}>
          <Text style={{ fontSize: 60 }}>🦸</Text>
          <Text style={styles.overlayTitle}>Choisis ta classe</Text>
          <Text style={styles.sub}>Changeable plus tard (5 💎).</Text>
          <View style={styles.classGrid}>
            {Object.values(CLASSES).map((c) => (
              <Pressable key={c.id} style={styles.classCard} onPress={() => setClass(c.id)}>
                <Text style={{ fontSize: 32 }}>{c.emoji}</Text>
                <Text style={styles.className}>{c.name}</Text>
                <Text style={styles.classDesc}>{c.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Gains hors-ligne */}
      <Modal visible={offline !== null} transparent animationType="fade" onRequestClose={() => setOffline(null)}>
        <View style={styles.overlay}>
          <Text style={{ fontSize: 44 }}>🌙</Text>
          <Text style={styles.overlayTitle}>Pendant ton absence</Text>
          <Text style={styles.sub}>Le donjon a continué de rapporter.</Text>
          <View style={styles.offRow}>
            <View style={{ alignItems: 'center' }}><Text style={[styles.offV, { color: colors.gold }]}>+{fmt(offline?.gold ?? 0)}</Text><Text style={styles.offL}>or</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={[styles.offV, { color: colors.xp }]}>+{fmt(offline?.xp ?? 0)}</Text><Text style={styles.offL}>XP</Text></View>
          </View>
          <Pressable style={styles.offBtn} onPress={() => setOffline(null)}><Text style={styles.offBtnTxt}>Récupérer</Text></Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function AchievementToast({ id, onDone }: { id: string; onDone: () => void }) {
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 260, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      Animated.delay(1900),
      Animated.timing(p, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => onDone());
  }, [id]);
  if (!a) return null;
  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [-90, 0] });
  const reward = a.reliques ? `+${a.reliques} 🏵️` : `+${a.gems ?? 0} 💎`;
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity: p, transform: [{ translateY }] }]}>
      <Text style={{ fontSize: 30 }}>{a.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.toastKicker}>🏆 Succès débloqué · {reward}</Text>
        <Text style={styles.toastName}>{a.name}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  toast: { position: 'absolute', top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 44, left: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.cardAlt, borderWidth: 1.5, borderColor: colors.gold, borderRadius: radius.md, padding: 12, zIndex: 100, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  toastKicker: { color: colors.gold, fontSize: font.tiny, fontWeight: '800' },
  toastName: { color: colors.text, fontSize: font.body, fontWeight: '900', marginTop: 1 },
  brand: { alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  brandTxt: { color: colors.text, fontSize: font.h3, fontWeight: '900', letterSpacing: 0.5 },
  tag: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '700' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgElevated, paddingBottom: Platform.OS === 'ios' ? 18 : 8, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center' },
  tabEmoji: { fontSize: 21 },
  tabLabel: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(6,4,16,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  overlayTitle: { color: colors.text, fontSize: font.h2, fontWeight: '900', marginTop: 10 },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: 4, textAlign: 'center' },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 20, maxWidth: 340 },
  classCard: { width: 150, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: 15, padding: 14, alignItems: 'center' },
  className: { color: colors.text, fontSize: font.body, fontWeight: '800', marginTop: 4 },
  classDesc: { color: colors.textMuted, fontSize: font.tiny, marginTop: 3, textAlign: 'center', lineHeight: 15 },
  offRow: { flexDirection: 'row', gap: 40, marginVertical: 22 },
  offV: { fontSize: font.h1, fontWeight: '900' },
  offL: { color: colors.textFaint, fontSize: font.small },
  offBtn: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 40, paddingVertical: 14 },
  offBtnTxt: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
});
