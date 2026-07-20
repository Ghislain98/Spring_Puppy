import { Category, HabitPreset, Stat } from './types';
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

// --- Modèles d'habitudes ---
export const HABIT_PRESETS: HabitPreset[] = [
  // Nutrition -> maxHp
  { id: 'nut_meal', category: 'nutrition', label: 'Repas équilibré', emoji: '🍲', xp: 40, gold: 25, stat: 'maxHp', statGain: 6 },
  { id: 'nut_veggies', category: 'nutrition', label: 'Fruits & légumes', emoji: '🥦', xp: 30, gold: 18, stat: 'maxHp', statGain: 4 },
  { id: 'nut_water', category: 'nutrition', label: '1,5L d’eau', emoji: '💧', xp: 20, gold: 12, stat: 'maxHp', statGain: 3 },
  { id: 'nut_nosugar', category: 'nutrition', label: 'Pas de sucre ajouté', emoji: '🚫🍬', xp: 35, gold: 20, stat: 'maxHp', statGain: 5 },
  { id: 'nut_homecook', category: 'nutrition', label: 'Repas fait maison', emoji: '👩‍🍳', xp: 30, gold: 18, stat: 'maxHp', statGain: 4 },

  // Sport -> atk
  { id: 'spo_workout', category: 'sport', label: 'Séance de sport', emoji: '🏋️', xp: 60, gold: 40, stat: 'atk', statGain: 5 },
  { id: 'spo_steps', category: 'sport', label: '10 000 pas', emoji: '🚶', xp: 40, gold: 25, stat: 'atk', statGain: 3 },
  { id: 'spo_run', category: 'sport', label: 'Course / vélo', emoji: '🏃', xp: 55, gold: 35, stat: 'atk', statGain: 4 },
  { id: 'spo_stretch', category: 'sport', label: 'Étirements', emoji: '🧘', xp: 25, gold: 15, stat: 'atk', statGain: 2 },
  { id: 'spo_stairs', category: 'sport', label: 'Escaliers (pas d’ascenseur)', emoji: '🪜', xp: 20, gold: 12, stat: 'atk', statGain: 2 },

  // Sommeil -> regen
  { id: 'sle_8h', category: 'sommeil', label: '8h de sommeil', emoji: '🛌', xp: 50, gold: 30, stat: 'regen', statGain: 4 },
  { id: 'sle_early', category: 'sommeil', label: 'Couché avant 23h', emoji: '🌙', xp: 40, gold: 25, stat: 'regen', statGain: 3 },
  { id: 'sle_noscreen', category: 'sommeil', label: 'Pas d’écran au lit', emoji: '📵', xp: 35, gold: 22, stat: 'regen', statGain: 3 },
  { id: 'sle_nap', category: 'sommeil', label: 'Sieste réparatrice', emoji: '💤', xp: 20, gold: 12, stat: 'regen', statGain: 2 },
];

export function presetsByCategory(cat: Category): HabitPreset[] {
  return HABIT_PRESETS.filter((h) => h.category === cat);
}

export function presetById(id: string): HabitPreset | undefined {
  return HABIT_PRESETS.find((h) => h.id === id);
}

// --- Intensités pour les habitudes personnalisées (récompenses standardisées) ---
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
