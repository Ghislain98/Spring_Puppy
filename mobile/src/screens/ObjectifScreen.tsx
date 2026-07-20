import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert } from 'react-native';
import { colors, radius, font, spacing } from '../theme';
import { Card } from '../components/ui';
import { useGame } from '../game/store';
import { VOIES } from '../game/config';
import { fmt } from '../game/engine';
import { haptics } from '../game/fx';
import { VoieId } from '../game/types';

export default function ObjectifScreen() {
  const body = useGame((s) => s.body);
  const setVoie = useGame((s) => s.setVoie);
  const weighIn = useGame((s) => s.weighIn);

  const [picking, setPicking] = useState(false);
  const [pick, setPick] = useState<VoieId | null>(null);
  const [w0, setW0] = useState('');
  const [wnow, setWnow] = useState('');
  const [reward, setReward] = useState<{ gold: number; gems: number; elan: boolean; chapterUp: boolean; chapter: number } | null>(null);

  const startBody = () => {
    const w = parseFloat(w0.replace(',', '.'));
    if (!pick) { Alert.alert('Choisis une Voie.'); return; }
    if (!(w > 20 && w < 400)) { Alert.alert('Entre un poids valide en kg.'); return; }
    setVoie(pick, w);
    setPicking(false); setPick(null); setW0('');
  };

  const doWeigh = () => {
    const w = parseFloat(wnow.replace(',', '.'));
    if (!(w > 20 && w < 400)) { Alert.alert('Entre un poids valide en kg.'); return; }
    const r = weighIn(w);
    setWnow('');
    if (r) { setReward(r); if (r.chapterUp) haptics.boss(); else haptics.buy(); }
  };

  // Choix / changement de Voie
  if (!body || picking) {
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Objectif</Text>
        <Text style={styles.intro}>Choisis ta <Text style={{ color: colors.gold, fontWeight: '800' }}>Voie</Text> : elle relie ton objectif corporel réel à la puissance de ton héros. Changeable quand tu veux.</Text>
        {(Object.values(VOIES)).map((v) => (
          <Pressable key={v.id} onPress={() => setPick(v.id)} style={[styles.voie, pick === v.id && { borderColor: colors.gold, backgroundColor: colors.cardAlt }]}>
            <Text style={{ fontSize: 30 }}>{v.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.voieNm}>{v.name}</Text>
              <Text style={styles.voieDs}>{v.desc}</Text>
            </View>
          </Pressable>
        ))}
        {!body && (
          <>
            <Text style={styles.section}>Ton point de départ</Text>
            <Card>
              <Text style={styles.lbl}>Ton poids actuel (kg) :</Text>
              <TextInput value={w0} onChangeText={setW0} keyboardType="decimal-pad" placeholder="ex. 72.5" placeholderTextColor={colors.textFaint} style={styles.input} />
            </Card>
          </>
        )}
        <Pressable style={styles.primary} onPress={body ? () => { if (pick) { setVoie(pick, body.weight); setPicking(false); setPick(null); } } : startBody}>
          <Text style={styles.primaryTxt}>{body ? 'Changer de Voie' : "Commencer l'aventure 🎯"}</Text>
        </Pressable>
        <Text style={styles.note}>💚 On récompense la régularité, jamais la vitesse. Aucune punition.</Text>
        {picking && <Pressable onPress={() => { setPicking(false); setPick(null); }} style={{ marginTop: 12, alignItems: 'center' }}><Text style={styles.link}>Annuler</Text></Pressable>}
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  }

  const v = VOIES[body.voie];
  let prog: number;
  if (body.dir === 'maintien') prog = 1 - Math.min(1, Math.abs(body.weight - body.anchor) / 1);
  else if (body.dir === 'perte') prog = (body.start - body.weight) / ((body.start - body.target) || 1);
  else prog = (body.weight - body.start) / ((body.target - body.start) || 1);
  prog = Math.max(0, Math.min(1, prog));
  const objTxt = body.dir === 'maintien' ? `Rester autour de ${body.anchor.toFixed(1)} kg (±1)` : `${body.dir === 'perte' ? 'Descendre à' : 'Monter à'} ${body.target.toFixed(1)} kg`;
  const bonus = body.voie === 'agilite' ? `+${2 * body.chapters}% dégâts, +${Math.min(15, body.chapters)}% crit, clic ×1,4`
    : body.voie === 'force' ? `+${5 * body.chapters}% PV, +${3 * body.chapters}% dégâts`
      : `+${4 * body.chapters}% or`;
  const weights = body.history.map((h) => h.w);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Objectif</Text>
        <View style={styles.chap}><Text style={styles.chapTxt}>Ch. {body.chapter}</Text></View>
      </View>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Text style={{ fontSize: 28 }}>{v.emoji}</Text>
          <View><Text style={styles.voieNm}>{v.name}</Text><Text style={styles.sub}>Objectif : {objTxt}</Text></View>
        </View>
        <View style={styles.qbar}><View style={[styles.qfill, { width: `${prog * 100}%` }]} /></View>
        <View style={styles.qmeta}>
          <Text style={styles.qm}>Départ {body.start.toFixed(1)}</Text>
          <Text style={styles.qm}>{Math.round(prog * 100)}%</Text>
          <Text style={styles.qm}>Cible {(body.dir === 'maintien' ? body.anchor : body.target).toFixed(1)}</Text>
        </View>
      </Card>

      <Text style={styles.section}>⚖️ Pesée</Text>
      <Card>
        <Text style={styles.lbl}>Actuel : <Text style={{ color: colors.text, fontWeight: '800' }}>{body.weight.toFixed(1)} kg</Text> · <Text style={{ color: colors.textFaint }}>en vrai : 1×/semaine</Text></Text>
        <TextInput value={wnow} onChangeText={setWnow} keyboardType="decimal-pad" placeholder={body.weight.toFixed(1)} placeholderTextColor={colors.textFaint} style={styles.input} />
        <Pressable style={[styles.primary, { marginTop: 10 }]} onPress={doWeigh}><Text style={styles.primaryTxt}>Enregistrer ma pesée ⚖️</Text></Pressable>
      </Card>

      <Text style={styles.section}>📜 Chronique du héros</Text>
      <Card><Sparkline values={weights} /></Card>

      <Text style={styles.section}>🌟 Bonus permanent de la Voie</Text>
      <Card><Text style={styles.sub}><Text style={{ color: colors.gold, fontWeight: '800' }}>{body.chapters}</Text> palier(s) franchi(s) — {bonus}</Text></Card>

      <Pressable onPress={() => { setPicking(true); setPick(body.voie); }} style={{ marginTop: 12, alignItems: 'center' }}><Text style={styles.link}>Changer de Voie</Text></Pressable>
      <View style={{ height: 20 }} />

      <Modal visible={reward !== null} transparent animationType="fade" onRequestClose={() => setReward(null)}>
        <View style={styles.backdrop}>
          <View style={styles.rewardCard}>
            <Text style={{ fontSize: 56 }}>{reward?.chapterUp ? '🏆' : '🎁'}</Text>
            <Text style={styles.rewardTitle}>{reward?.chapterUp ? 'Palier franchi !' : 'Coffre de la Constance'}</Text>
            {reward?.chapterUp && <Text style={styles.sub}>Nouveau chapitre {reward.chapter} — sans fin.</Text>}
            <View style={styles.rewardRow}>
              <View style={styles.rw}><Text style={[styles.rwv, { color: colors.gold }]}>+{fmt(reward?.gold ?? 0)}</Text><Text style={styles.rwl}>or</Text></View>
              <View style={styles.rw}><Text style={[styles.rwv, { color: colors.gem }]}>+{reward?.gems ?? 0}</Text><Text style={styles.rwl}>💎</Text></View>
              {reward?.elan && <View style={styles.rw}><Text style={[styles.rwv, { color: colors.regen }]}>⚡×2</Text><Text style={styles.rwl}>24h</Text></View>}
            </View>
            <Text style={styles.sub}>{reward?.elan ? 'Élan activé : ×2 or & dégâts 24h !' : 'Merci d’avoir pris soin de toi. 💚'}</Text>
            <Pressable style={[styles.primary, { marginTop: 16 }]} onPress={() => setReward(null)}><Text style={styles.primaryTxt}>Récupérer ⚔️</Text></Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <Text style={[styles.sub, { textAlign: 'center' }]}>Enregistre au moins 2 pesées pour voir ta courbe.</Text>;
  const recent = values.slice(-20);
  const mn = Math.min(...recent), mx = Math.max(...recent), rg = (mx - mn) || 1;
  return (
    <View style={styles.spark}>
      {recent.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
          <View style={{ width: 4, height: 6 + ((v - mn) / rg) * 42, backgroundColor: colors.gold, borderRadius: 2 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: colors.text, fontSize: font.h1, fontWeight: '900' },
  intro: { color: colors.textMuted, fontSize: font.small, marginBottom: 14, lineHeight: 20 },
  sub: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  voie: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 10 },
  voieNm: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  voieDs: { color: colors.textMuted, fontSize: font.small, marginTop: 2 },
  section: { color: colors.gold, fontSize: font.small, fontWeight: '800', marginTop: spacing(4), marginBottom: 8 },
  lbl: { color: colors.textMuted, fontSize: font.small, marginBottom: 8 },
  input: { backgroundColor: colors.bgElevated, borderWidth: 1.5, borderColor: colors.border, color: colors.text, borderRadius: 14, padding: 14, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  primary: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
  primaryTxt: { color: '#2a1c00', fontWeight: '900', fontSize: font.body },
  note: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', marginTop: 10, lineHeight: 19 },
  link: { color: colors.textMuted, fontSize: font.small, textDecorationLine: 'underline' },
  chap: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.goldDim, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chapTxt: { color: colors.gold, fontWeight: '900', fontSize: font.body },
  qbar: { height: 16, backgroundColor: '#0c0920', borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, overflow: 'hidden' },
  qfill: { height: '100%', backgroundColor: colors.gold, borderRadius: radius.pill },
  qmeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  qm: { color: colors.textMuted, fontSize: font.tiny },
  spark: { flexDirection: 'row', alignItems: 'flex-end', height: 54, gap: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(6,4,16,0.82)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  rewardCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 24, alignItems: 'center', width: '100%', maxWidth: 340 },
  rewardTitle: { color: colors.text, fontSize: font.h2, fontWeight: '900', marginTop: 8 },
  rewardRow: { flexDirection: 'row', gap: 24, marginVertical: 18 },
  rw: { alignItems: 'center' },
  rwv: { fontSize: font.h1, fontWeight: '900' },
  rwl: { color: colors.textFaint, fontSize: font.small },
});
