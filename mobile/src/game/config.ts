import { Category, CheckItem, ClassId, Stat, VoieId, BodyDir } from './types';
import { colors } from '../theme';

// ---- Catégories de check-in ----
export interface CategoryMeta {
  key: Category;
  label: string;
  emoji: string;
  color: string;
  tag: string;
  stat: Stat;
}
export const CATEGORIES: Record<Category, CategoryMeta> = {
  sport: { key: 'sport', label: 'Sport', emoji: '💪', color: colors.sport, tag: "L'effort forge l'attaque", stat: 'atk' },
  nutrition: { key: 'nutrition', label: 'Nutrition', emoji: '🥗', color: colors.nutrition, tag: 'Bien manger renforce la vitalité', stat: 'maxHp' },
  sommeil: { key: 'sommeil', label: 'Sommeil', emoji: '😴', color: colors.sommeil, tag: 'Le repos accélère la régénération', stat: 'regen' },
};
export const CHECKIN_ORDER: Category[] = ['sport', 'nutrition', 'sommeil'];

export const CHECK_ITEMS: CheckItem[] = [
  { id: 'spo', category: 'sport', label: "Tu t'es entraîné ?", emoji: '🏋️', stat: 'atk', kind: 'choice', options: [
    { id: 'n', label: 'Non', xp: 0, gold: 0, statGain: 0 },
    { id: 'l', label: 'Léger', xp: 30, gold: 18, statGain: 3 },
    { id: 'm', label: 'Modéré', xp: 55, gold: 35, statGain: 5 },
    { id: 'i', label: 'Intense', xp: 85, gold: 55, statGain: 8 } ] },
  { id: 'cal', category: 'nutrition', label: 'Objectif calories ?', emoji: '🎯', stat: 'maxHp', kind: 'toggle', reward: { xp: 40, gold: 25, statGain: 5 } },
  { id: 'pro', category: 'nutrition', label: 'Assez de protéines ?', emoji: '🍗', stat: 'maxHp', kind: 'toggle', reward: { xp: 25, gold: 15, statGain: 3 } },
  { id: 'veg', category: 'nutrition', label: 'Légumes / fibres ?', emoji: '🥦', stat: 'maxHp', kind: 'toggle', reward: { xp: 25, gold: 15, statGain: 3 } },
  { id: 'fru', category: 'nutrition', label: 'Fruits ?', emoji: '🍎', stat: 'maxHp', kind: 'toggle', reward: { xp: 20, gold: 12, statGain: 2 } },
  { id: 'water', category: 'nutrition', label: "Combien d'eau ?", emoji: '💧', stat: 'maxHp', kind: 'choice', options: [
    { id: 'n', label: '<1L', xp: 0, gold: 0, statGain: 0 },
    { id: 'a', label: '1L', xp: 15, gold: 8, statGain: 2 },
    { id: 'b', label: '1,5L', xp: 25, gold: 15, statGain: 3 },
    { id: 'c', label: '2L+', xp: 35, gold: 20, statGain: 4 } ] },
  { id: 'sleep', category: 'sommeil', label: 'Combien de sommeil ?', emoji: '🛌', stat: 'regen', kind: 'choice', options: [
    { id: 'a', label: '<6h', xp: 10, gold: 5, statGain: 1 },
    { id: 'b', label: '6–7h', xp: 30, gold: 18, statGain: 2 },
    { id: 'c', label: '7–8h', xp: 50, gold: 30, statGain: 4 },
    { id: 'd', label: '8h+', xp: 60, gold: 38, statGain: 5 } ] },
];
export function checkItemsByCategory(cat: Category): CheckItem[] {
  return CHECK_ITEMS.filter((i) => i.category === cat);
}

// ---- Classes ----
export interface ClassMeta {
  id: ClassId;
  name: string;
  emoji: string;
  hp: number;
  dmg: number;
  gold: number;
  crit: number;
  click: number;
  regen: number;
  desc: string;
}
export const CLASSES: Record<ClassId, ClassMeta> = {
  guerrier: { id: 'guerrier', name: 'Guerrier', emoji: '⚔️', hp: 1.35, dmg: 1.15, gold: 1, crit: 0, click: 1, regen: 1, desc: 'Robuste. +35% PV, +15% dégâts.' },
  mage: { id: 'mage', name: 'Mage', emoji: '🔮', hp: 0.85, dmg: 1.2, gold: 1, crit: 6, click: 2.2, regen: 1, desc: 'Fragile mais foudroyant. Clic ×2,2, +6% crit.' },
  rodeur: { id: 'rodeur', name: 'Rôdeur', emoji: '🏹', hp: 1.0, dmg: 1.0, gold: 1.25, crit: 12, click: 1.6, regen: 1, desc: 'Cupide et précis. +25% or, +12% crit.' },
  paladin: { id: 'paladin', name: 'Paladin', emoji: '🛡️', hp: 1.3, dmg: 1.0, gold: 1.1, crit: 0, click: 1, regen: 2.6, desc: 'Increvable. +30% PV, régén ×2,6.' },
};

// ---- Compagnons (or/sec) ----
export interface Companion {
  id: string;
  name: string;
  emoji: string;
  rate: number;
  base: number;
}
export const COMPANIONS: Companion[] = [
  { id: 'torche', name: 'Porteur de torche', emoji: '🔥', rate: 1, base: 15 },
  { id: 'marchand', name: 'Marchand ambulant', emoji: '🎒', rate: 9, base: 120 },
  { id: 'forgeron', name: 'Forgeron nain', emoji: '⚒️', rate: 55, base: 1300 },
  { id: 'sorciere', name: 'Sorcière', emoji: '🧙', rate: 300, base: 14000 },
  { id: 'golem', name: 'Golem porteur', emoji: '🗿', rate: 1650, base: 160000 },
  { id: 'dragon', name: 'Dragon apprivoisé', emoji: '🐲', rate: 9000, base: 2000000 },
];

// ---- Talents (gemmes) ----
export interface Talent {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  base: number;
  max: number;
}
export const TALENTS: Talent[] = [
  { id: 'force', name: 'Force brute', emoji: '💪', desc: '+25% dégâts / niv', base: 2, max: 25 },
  { id: 'cupidite', name: 'Cupidité', emoji: '🪙', desc: '+25% or / niv', base: 2, max: 25 },
  { id: 'precision', name: 'Précision', emoji: '🎯', desc: '+5% critique / niv', base: 3, max: 12 },
  { id: 'frappe', name: 'Frappe véloce', emoji: '👊', desc: '+120% dégâts de clic / niv', base: 2, max: 20 },
  { id: 'tresorier', name: 'Trésorier', emoji: '📈', desc: '+20% or/sec / niv', base: 3, max: 25 },
  { id: 'souffle', name: 'Second souffle', emoji: '🌙', desc: '+2h de gains hors-ligne / niv', base: 5, max: 8 },
];

// ---- Forge (or) ----
export interface ForgeUpgrade {
  key: Stat;
  emoji: string;
  name: string;
  desc: string;
  color: string;
}
export const FORGE: ForgeUpgrade[] = [
  { key: 'atk', emoji: '⚔️', name: 'Aiguiser la lame', desc: '+3 attaque', color: colors.hp },
  { key: 'click', emoji: '🗡️', name: 'Dague affûtée', desc: '+3 dégâts de clic', color: colors.xp },
  { key: 'maxHp', emoji: '🛡️', name: 'Armure', desc: '+20 PV max', color: colors.regen },
  { key: 'regen', emoji: '🧪', name: 'Élixir de régén.', desc: '+2 régén./s', color: colors.sommeil },
  { key: 'crit', emoji: '🎯', name: 'Œil du chasseur', desc: '+2% critique', color: colors.gold },
];

// ---- Voies (objectif corporel) ----
export interface VoieMeta {
  id: VoieId;
  name: string;
  emoji: string;
  dir: BodyDir;
  desc: string;
}
export const VOIES: Record<VoieId, VoieMeta> = {
  agilite: { id: 'agilite', name: "Voie de l'Agilité", emoji: '🏃', dir: 'perte', desc: 'Perte de poids — chaque palier : +crit & clic' },
  force: { id: 'force', name: 'Voie de la Force', emoji: '🏋️', dir: 'prise', desc: 'Prise de masse — chaque palier : +PV & dégâts' },
  equilibre: { id: 'equilibre', name: "Voie de l'Équilibre", emoji: '⚖️', dir: 'maintien', desc: 'Maintien — chaque palier : +or' },
};
export const BODY_STEP = 1.0; // kg par palier

// ---- Constantes ----
export const GAME = {
  MPF: 8,
  CRIT_MULT: 2,
  TICK_MS: 200,
  BASE: { atk: 4, maxHp: 60, regen: 2, crit: 3 } as Record<'atk' | 'maxHp' | 'regen' | 'crit', number>,
  UP_GAIN: { atk: 3, maxHp: 20, regen: 2, crit: 2, click: 3 } as Record<Stat, number>,
  UP_BASE: { atk: 50, maxHp: 40, regen: 60, crit: 120, click: 80 } as Record<Stat, number>,
  MAX_LOG: 26,
};

export function xpForLevel(l: number): number {
  return Math.floor(50 * (l - 1) * l);
}
export function levelFromXp(xp: number): number {
  let l = 1;
  while (xpForLevel(l + 1) <= xp) l++;
  return l;
}
