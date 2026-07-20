// Modèle de jeu — idle-RPG fantasy alimenté par les habitudes santé.

export type Category = 'sport' | 'nutrition' | 'sommeil';
export type Stat = 'atk' | 'maxHp' | 'regen' | 'crit' | 'click';
export type ClassId = 'guerrier' | 'mage' | 'rodeur' | 'paladin';
export type VoieId = 'agilite' | 'force' | 'equilibre';
export type BodyDir = 'perte' | 'prise' | 'maintien';

// Récompense de base d'un item de check-in.
export interface CheckReward {
  xp: number;
  gold: number;
  statGain: number;
}
export interface CheckOption extends CheckReward {
  id: string;
  label: string;
}
export interface CheckItem {
  id: string;
  category: Category;
  label: string;
  emoji: string;
  stat: Stat;
  kind: 'toggle' | 'choice';
  reward?: CheckReward;
  options?: CheckOption[];
}

// Une récompense sélectionnée pendant le check-in, prête à encaisser.
export interface ClaimEntry {
  category: Category;
  label: string;
  emoji: string;
  xp: number;
  gold: number;
  stat: Stat;
  statGain: number;
}

export interface WeighIn {
  ts: number;
  w: number;
}

export interface BodyGoal {
  voie: VoieId;
  dir: BodyDir;
  weight: number;
  start: number;
  anchor: number;
  target: number;
  chapter: number;
  chapters: number; // paliers franchis (bonus permanent)
  history: WeighIn[];
  lastWeighIn: number;
  elanUntil: number;
}

export interface GameState {
  gold: number;
  gems: number;
  reliques: number; // monnaie de prestige (Renaissance)
  xp: number;
  level: number;
  cls: ClassId | null;

  habitStats: Record<Stat, number>; // gains permanents via check-in
  upgrades: Record<Stat, number>; // forge (or)
  talents: Record<string, number>; // gemmes
  companions: Record<string, number>; // or/sec

  floor: number;
  monsterIndex: number;
  monsterHp: number;
  heroHp: number;

  // Check-in
  todayDate: string;
  todayLog: { emoji: string; label: string; xp: number; gold: number; ts: number }[];
  streak: number;
  lastCheckinDate: string | null;
  buffUntil: number; // Bénédiction ×1,5 (check-in)

  // Objectif corporel (infini)
  body: BodyGoal | null;

  // Journal & stats
  dungeonLog: string[];
  totalDmg: number;
  kills: number;
  bestFloor: number;

  // Réglages
  notificationsEnabled: boolean;
  reminderHour: number;

  lastActive: number;
}
