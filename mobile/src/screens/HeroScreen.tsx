import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card } from '../components/ui';
import { useGame } from '../game/store';
import { CLASSES, FORGE, xpForLevel } from '../game/config';
import { derive, fmt, upgradeCost, reliquesGain } from '../game/engine';
import { haptics } from '../game/fx';
import { scheduleDailyReminder, cancelDailyReminder } from '../game/notifications';

export default function HeroScreen() {
  const s = useGame();
  const buyUpgrade = useGame((st) => st.buyUpgrade);
  const setClass = useGame((st) => st.setClass);
  const prestige = useGame((st) => st.prestige);
  const setNotifications = useGame((st) => st.setNotifications);
  const resetGame = useGame((st) => st.resetGame);
  const d = derive(s);
  const c = CLASSES[s.cls || 'guerrier'];
  const cur = xpForLevel(s.level), nxt = xpForLevel(s.level + 1);

  const pickClass = (id: keyof typeof CLASSES) => {
    if (s.cls === id) return;
    if (s.cls && s.gems < 5) { Alert.alert('Pas assez de gemmes', 'Changer de classe coûte 5 💎.'); return; }
    if (s.cls) {
      Alert.alert('Changer de classe ?', 'Coût : 5 💎.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Changer', onPress: () => setClass(id) },
      ]);
    } else setClass(id);
  };

  const toggleNotif = async (v: boolean) => {
    if (v) {
      const ok = await scheduleDailyReminder(s.reminderHour);
      if (!ok) { Alert.alert('Notifications refusées', 'Autorise les notifications dans les réglages du téléphone.'); return; }
      setNotifications(true, s.reminderHour);
    } else { await cancelDailyReminder(); setNotifications(false, s.reminderHour); }
  };

  const prestigeGain = reliquesGain(s.floor);
  const doPrestige = () => {
    if (prestigeGain <= 0) return;
    Alert.alert('Renaissance ?', `Tu réinitialises ta run et gagnes ${prestigeGain} 🏵️ reliques permanentes (+${4 * prestigeGain}% dégâts & or).`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Renaître', onPress: () => { if (prestige() > 0) haptics.boss(); } },
    ]);
  };

  const confirmReset = () => Alert.alert('Recommencer ?', 'Efface toute la progression.', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Tout effacer', style: 'destructive', onPress: () => resetGame() },
  ]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Héros</Text>
        <View style={styles.pill}><Text style={styles.pillTxt}>💰 {fmt(s.gold)}</Text></View>
      </View>

      <Card style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 52 }}>{c.emoji}</Text>
        <Text style={styles.level}>Niveau {s.level} · {c.name}</Text>
        <Text style={styles.sub}>{fmt(s.xp - cur)} / {fmt(nxt - cur)} XP</Text>
        <View style={styles.xpbar}><View style={[styles.xpfill, { width: `${Math.min(100, ((s.xp - cur) / (nxt - cur)) * 100)}%` }]} /></View>
      </Card>

      <Text style={styles.section}>Statistiques</Text>
      <Card>
        <View style={styles.grid}>
          <Stat label="DPS" value={fmt(d.dps)} color={colors.hp} />
          <Stat label="Dégâts/clic" value={fmt(d.clickDmg)} color={colors.xp} />
          <Stat label="Or/sec" value={fmt(d.goldSec)} color={colors.gold} />
        </View>
        <View style={[styles.grid, { marginTop: 14 }]}>
          <Stat label="PV max" value={String(Math.round(d.maxHp))} color={colors.regen} />
          <Stat label="Critique" value={`${Math.round(d.crit)}%`} color={colors.gold} />
          <Stat label="Dégâts cumulés" value={fmt(s.totalDmg)} color={colors.textMuted} />
        </View>
      </Card>

      <Text style={styles.section}>⚔️ Classe</Text>
      <View style={styles.classGrid}>
        {Object.values(CLASSES).map((cl) => (
          <Pressable key={cl.id} onPress={() => pickClass(cl.id)} style={[styles.classCard, s.cls === cl.id && { borderColor: colors.gold, backgroundColor: colors.cardAlt }]}>
            <Text style={{ fontSize: 32 }}>{cl.emoji}</Text>
            <Text style={styles.className}>{cl.name}</Text>
            <Text style={styles.classDesc}>{cl.desc}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>🔨 Forge · dépense ton or</Text>
      {FORGE.map((u) => {
        const cost = upgradeCost(s, u.key);
        const can = s.gold >= cost;
        return (
          <Pressable key={u.key} onPress={() => { if (buyUpgrade(u.key)) haptics.buy(); }} style={[styles.buy, { borderColor: can ? u.color : colors.border, opacity: can ? 1 : 0.7 }]}>
            <Text style={styles.buyEm}>{u.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.buyNm}>{u.name} <Text style={styles.small}>Niv. {s.upgrades[u.key]}</Text></Text>
              <Text style={styles.buyDs}>{u.desc}</Text>
            </View>
            <Text style={[styles.cost, { color: can ? colors.gold : colors.textFaint }]}>💰{fmt(cost)}</Text>
          </Pressable>
        );
      })}

      <Text style={styles.section}>🌟 Renaissance</Text>
      <Card>
        <Text style={styles.buyDs}>
          Recommence la run du donjon (or, compagnons, forge, étage) contre des{' '}
          <Text style={{ color: colors.gold, fontWeight: '800' }}>Reliques</Text> permanentes : +4% dégâts & or chacune.
          Tu gardes gemmes, talents, classe, objectif et streak.
        </Text>
        <View style={[styles.grid, { marginTop: 12 }]}>
          <Stat label="Reliques" value={`🏵️ ${s.reliques}`} color={colors.gold} />
          <Stat label="Bonus actuel" value={`+${4 * s.reliques}%`} color={colors.regen} />
          <Stat label="Gain si tu renais" value={`+${prestigeGain}`} color={colors.xp} />
        </View>
        <Pressable
          onPress={doPrestige}
          disabled={prestigeGain <= 0}
          style={[styles.prestigeBtn, prestigeGain <= 0 && { opacity: 0.4 }]}
        >
          <Text style={styles.prestigeTxt}>{prestigeGain > 0 ? `Renaître (+${prestigeGain} 🏵️)` : 'Atteins l’étage 5 pour renaître'}</Text>
        </Pressable>
      </Card>

      <Text style={styles.section}>🔔 Rappel quotidien</Text>
      <Card>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Text style={styles.buyDs}>Un rappel doux (opt-in) pour ton check-in.</Text>
          </View>
          <Switch value={s.notificationsEnabled} onValueChange={toggleNotif} trackColor={{ true: colors.gold, false: colors.border }} thumbColor={colors.text} />
        </View>
      </Card>

      <Pressable onPress={confirmReset} style={{ alignItems: 'center', paddingVertical: 14 }}>
        <Text style={styles.reset}>Réinitialiser la progression</Text>
      </Pressable>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color, fontSize: font.h3, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  pill: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldDim, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
  pillTxt: { color: colors.gold, fontWeight: '900', fontSize: font.body },
  level: { color: colors.text, fontSize: font.h3, fontWeight: '900', marginTop: 4 },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  xpbar: { width: '100%', height: 9, backgroundColor: colors.bgElevated, borderRadius: radius.pill, marginTop: 8, overflow: 'hidden' },
  xpfill: { height: '100%', backgroundColor: colors.xp, borderRadius: radius.pill },
  section: { color: colors.gold, fontSize: font.small, fontWeight: '800', marginTop: spacing(4), marginBottom: 8 },
  grid: { flexDirection: 'row' },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  classCard: { width: '47.5%', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: 15, padding: 13, alignItems: 'center' },
  className: { fontSize: font.body, fontWeight: '800', color: colors.text, marginTop: 4 },
  classDesc: { color: colors.textMuted, fontSize: font.tiny, marginTop: 3, textAlign: 'center', lineHeight: 15 },
  buy: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1.5, borderRadius: 14, padding: 13, marginBottom: 10 },
  buyEm: { fontSize: 26, width: 30, textAlign: 'center' },
  buyNm: { color: colors.text, fontWeight: '800', fontSize: font.body },
  small: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '700' },
  buyDs: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  cost: { fontWeight: '900', fontSize: font.small },
  prestigeBtn: { marginTop: 14, backgroundColor: colors.cardAlt, borderWidth: 1.5, borderColor: colors.gold, borderRadius: radius.pill, paddingVertical: 13, alignItems: 'center' },
  prestigeTxt: { color: colors.gold, fontWeight: '900', fontSize: font.body },
  rowBetween: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  reset: { color: colors.textFaint, fontSize: font.small, textDecorationLine: 'underline' },
});
