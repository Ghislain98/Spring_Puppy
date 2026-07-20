import { GameState } from './types';

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  done: (s: GameState) => boolean;
  gems?: number;
  reliques?: number;
}

const compTotal = (s: GameState) => Object.values(s.companions).reduce((a, n) => a + n, 0);
const talTotal = (s: GameState) => Object.values(s.talents).reduce((a, n) => a + n, 0);

export const ACHIEVEMENTS: Achievement[] = [
  // Donjon
  { id: 'floor5', name: 'Premiers pas', desc: 'Atteindre l’étage 5', emoji: '🏰', done: (s) => s.bestFloor >= 5, gems: 3 },
  { id: 'floor10', name: 'Explorateur', desc: 'Atteindre l’étage 10', emoji: '🗺️', done: (s) => s.bestFloor >= 10, gems: 5 },
  { id: 'floor25', name: 'Aventurier', desc: 'Atteindre l’étage 25', emoji: '🧭', done: (s) => s.bestFloor >= 25, gems: 10 },
  { id: 'floor50', name: 'Conquérant', desc: 'Atteindre l’étage 50', emoji: '👑', done: (s) => s.bestFloor >= 50, reliques: 3 },
  { id: 'kills100', name: 'Nettoyeur', desc: 'Vaincre 100 monstres', emoji: '⚔️', done: (s) => s.kills >= 100, gems: 3 },
  { id: 'kills1000', name: 'Fléau du donjon', desc: 'Vaincre 1 000 monstres', emoji: '💀', done: (s) => s.kills >= 1000, gems: 8 },
  { id: 'level10', name: 'Aguerri', desc: 'Héros niveau 10', emoji: '⭐', done: (s) => s.level >= 10, gems: 4 },
  { id: 'level25', name: 'Vétéran', desc: 'Héros niveau 25', emoji: '🌟', done: (s) => s.level >= 25, gems: 8 },

  // Idle / économie
  { id: 'comp10', name: 'Petite troupe', desc: 'Posséder 10 compagnons', emoji: '🤝', done: (s) => compTotal(s) >= 10, gems: 4 },
  { id: 'comp50', name: 'Armée de l’ombre', desc: 'Posséder 50 compagnons', emoji: '🏴', done: (s) => compTotal(s) >= 50, gems: 10 },
  { id: 'tal10', name: 'Éveil', desc: '10 niveaux de talents', emoji: '🌀', done: (s) => talTotal(s) >= 10, gems: 6 },
  { id: 'reliq1', name: 'Renaissance', desc: 'Obtenir ta 1ère relique', emoji: '🏵️', done: (s) => s.reliques >= 1, gems: 5 },
  { id: 'reliq10', name: 'Âme forgée', desc: 'Cumuler 10 reliques', emoji: '🔥', done: (s) => s.reliques >= 10, reliques: 2 },

  // Santé (le cœur du jeu)
  { id: 'streak3', name: 'On s’y tient', desc: '3 jours de check-in d’affilée', emoji: '🔥', done: (s) => s.streak >= 3, gems: 4 },
  { id: 'streak7', name: 'Une semaine !', desc: '7 jours d’affilée', emoji: '📅', done: (s) => s.streak >= 7, gems: 8 },
  { id: 'streak30', name: 'Discipline de fer', desc: '30 jours d’affilée', emoji: '🏆', done: (s) => s.streak >= 30, reliques: 3 },
  { id: 'chap1', name: 'En chemin', desc: 'Franchir 1 palier d’objectif', emoji: '🎯', done: (s) => !!s.body && s.body.chapters >= 1, gems: 5 },
  { id: 'chap5', name: 'Transformation', desc: 'Franchir 5 paliers d’objectif', emoji: '💪', done: (s) => !!s.body && s.body.chapters >= 5, reliques: 2 },
  { id: 'weigh10', name: 'Suivi régulier', desc: 'Enregistrer 10 pesées', emoji: '⚖️', done: (s) => !!s.body && s.body.history.length >= 10, gems: 6 },
];

export interface UnlockResult {
  ids: string[];
  gems: number;
  reliques: number;
}

// Renvoie les succès nouvellement débloqués (non encore dans `unlocked`).
export function evaluate(s: GameState): UnlockResult {
  const ids: string[] = [];
  let gems = 0, reliques = 0;
  for (const a of ACHIEVEMENTS) {
    if (!s.unlocked.includes(a.id) && a.done(s)) {
      ids.push(a.id);
      gems += a.gems || 0;
      reliques += a.reliques || 0;
    }
  }
  return { ids, gems, reliques };
}
