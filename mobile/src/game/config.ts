import { Category, Stat } from './types';
import { colors } from '../theme';

// --- Catégories ---
export interface CategoryMeta {
  key: Category;
  label: string;
  emoji: string;
  color: string;
  tagline: string;
  boosts: Stat;
  boostLabel: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'nutrition',
    label: 'Nutrition',
    emoji: '🥗',
    color: colors.nutrition,
    tagline: 'Bien manger renforce la vitalité de ton héros',
    boosts: 'maxHp',
    boostLabel: 'PV max',
  },
  {
    key: 'sport',
    label: 'Sport',
    emoji: '💪',
    color: colors.sport,
    tagline: "L'effort forge la puissance d'attaque",
    boosts: 'atk',
    boostLabel: 'Attaque',
  },
  {
    key: 'sommeil',
    label: 'Sommeil',
    emoji: '😴',
    color: colors.sommeil,
    tagline: 'Un bon repos accélère la régénération',
    boosts: 'regen',
    boostLabel: 'Régén.',
  },
];

export function categoryMeta(key: Category): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key)!;
}

// --- Contenu du check-in quotidien ---
// Chaque question est soit un interrupteur (fait / pas fait), soit un choix
// à plusieurs paliers (intensité, quantité...). La stat renforcée dépend de la
// catégorie (nutrition -> PV, sport -> attaque, sommeil -> régén).

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
  reward?: CheckReward; // pour kind === 'toggle'
  options?: CheckOption[]; // pour kind === 'choice' (le 1er palier = "non", récompense nulle)
}

export const CHECK_ITEMS: CheckItem[] = [
  // --- SPORT -> attaque ---
  {
    id: 'spo_workout',
    category: 'sport',
    label: "Tu t'es entraîné aujourd'hui ?",
    emoji: '🏋️',
    stat: 'atk',
    kind: 'choice',
    options: [
      { id: 'none', label: 'Non', xp: 0, gold: 0, statGain: 0 },
      { id: 'light', label: 'Léger', xp: 30, gold: 18, statGain: 3 },
      { id: 'moderate', label: 'Modéré', xp: 55, gold: 35, statGain: 5 },
      { id: 'intense', label: 'Intense', xp: 85, gold: 55, statGain: 8 },
    ],
  },

  // --- NUTRITION -> PV max ---
  {
    id: 'nut_calories',
    category: 'nutrition',
    label: 'Objectif calories atteint ?',
    emoji: '🎯',
    stat: 'maxHp',
    kind: 'toggle',
    reward: { xp: 40, gold: 25, statGain: 5 },
  },
  {
    id: 'nut_protein',
    category: 'nutrition',
    label: 'Assez de protéines ?',
    emoji: '🍗',
    stat: 'maxHp',
    kind: 'toggle',
    reward: { xp: 25, gold: 15, statGain: 3 },
  },
  {
    id: 'nut_veggies',
    category: 'nutrition',
    label: 'Légumes / fibres ?',
    emoji: '🥦',
    stat: 'maxHp',
    kind: 'toggle',
    reward: { xp: 25, gold: 15, statGain: 3 },
  },
  {
    id: 'nut_fruits',
    category: 'nutrition',
    label: 'Fruits ?',
    emoji: '🍎',
    stat: 'maxHp',
    kind: 'toggle',
    reward: { xp: 20, gold: 12, statGain: 2 },
  },
  {
    id: 'nut_water',
    category: 'nutrition',
    label: "Combien d'eau ?",
    emoji: '💧',
    stat: 'maxHp',
    kind: 'choice',
    options: [
      { id: 'low', label: '< 1L', xp: 0, gold: 0, statGain: 0 },
      { id: '1l', label: '1L', xp: 15, gold: 8, statGain: 2 },
      { id: '1.5l', label: '1,5L', xp: 25, gold: 15, statGain: 3 },
      { id: '2l', label: '2L+', xp: 35, gold: 20, statGain: 4 },
    ],
  },

  // --- SOMMEIL -> régénération ---
  {
    id: 'sle_hours',
    category: 'sommeil',
    label: 'Combien de sommeil ?',
    emoji: '🛌',
    stat: 'regen',
    kind: 'choice',
    options: [
      { id: 'lt6', label: '< 6h', xp: 10, gold: 5, statGain: 1 },
      { id: '6to7', label: '6–7h', xp: 30, gold: 18, statGain: 2 },
      { id: '7to8', label: '7–8h', xp: 50, gold: 30, statGain: 4 },
      { id: 'gt8', label: '8h+', xp: 60, gold: 38, statGain: 5 },
    ],
  },
];

export function checkItemsByCategory(cat: Category): CheckItem[] {
  return CHECK_ITEMS.filter((i) => i.category === cat);
}

// Ordre de parcours des étapes du check-in.
export const CHECKIN_ORDER: Category[] = ['sport', 'nutrition', 'sommeil'];

// --- Intensités pour les items personnalisés (récompenses standardisées) ---
export type Intensity = 'facile' | 'moyen' | 'difficile';

export const INTENSITIES: { key: Intensity; label: string; xp: number; gold: number; statGain: number }[] = [
  { key: 'facile', label: 'Facile', xp: 20, gold: 12, statGain: 2 },
  { key: 'moyen', label: 'Moyen', xp: 40, gold: 25, statGain: 4 },
  { key: 'difficile', label: 'Difficile', xp: 65, gold: 42, statGain: 6 },
];

export function intensity(key: Intensity) {
  return INTENSITIES.find((i) => i.key === key)!;
}

// Emojis proposés à la création d'une habitude perso.
export const EMOJI_CHOICES = ['⭐', '🥗', '🏃', '🧘', '💊', '📖', '💧', '☀️', '🚭', '🧠', '🦷', '🚴', '🏊', '🌿'];

// --- Constantes de jeu ---
export const GAME = {
  MONSTERS_PER_FLOOR: 8, // le 8e est un boss
  OFFLINE_CAP_SEC: 8 * 3600, // gains hors-ligne plafonnés à 8h
  TICK_MS: 1000,

  // Stats de base du héros (avant habitudes / améliorations)
  BASE: { atk: 4, maxHp: 60, regen: 2, crit: 3 },

  CRIT_MULTIPLIER: 2, // dégâts x2 sur coup critique
  MAX_DUNGEON_LOG: 40,
};

// XP nécessaire pour atteindre le niveau `lvl` (cumulé).
export function xpForLevel(lvl: number): number {
  // 0 au niv.1, puis croissance quadratique douce
  return Math.floor(50 * (lvl - 1) * lvl);
}

export function levelFromXp(xp: number): number {
  let lvl = 1;
  while (xpForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
}
