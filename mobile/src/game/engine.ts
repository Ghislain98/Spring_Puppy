import { GameState, Stat } from './types';
import { GAME } from './config';

// ---- Stats effectives du héros = base + habitudes + améliorations ----
// Les améliorations donnent un gain par niveau acheté.
const UPGRADE_GAIN: Record<Stat, number> = {
  atk: 3,
  maxHp: 20,
  regen: 2,
  crit: 2,
};

export function effectiveStat(state: GameState, stat: Stat): number {
  return (
    GAME.BASE[stat] +
    (state.habitStats[stat] || 0) +
    (state.upgrades[stat] || 0) * UPGRADE_GAIN[stat]
  );
}

// Dégâts par seconde du héros (attaque + espérance de critique).
export function heroDps(state: GameState): number {
  const atk = effectiveStat(state, 'atk');
  const crit = Math.min(75, effectiveStat(state, 'crit')); // % plafonné à 75
  const critFactor = 1 + (crit / 100) * (GAME.CRIT_MULTIPLIER - 1);
  return atk * critFactor;
}

// ---- Monstres : mise à l'échelle par étage ----
export function monsterMaxHp(floor: number, index: number): number {
  const base = 30 * Math.pow(1.35, floor - 1);
  const isBoss = index >= GAME.MONSTERS_PER_FLOOR - 1;
  const scale = 1 + index * 0.12;
  return Math.ceil(base * scale * (isBoss ? 4 : 1));
}

export function monsterAtk(floor: number, index: number): number {
  const isBoss = index >= GAME.MONSTERS_PER_FLOOR - 1;
  return Math.ceil(3 * Math.pow(1.28, floor - 1) * (isBoss ? 2.2 : 1));
}

export function goldPerKill(floor: number, index: number): number {
  const isBoss = index >= GAME.MONSTERS_PER_FLOOR - 1;
  return Math.ceil(6 * Math.pow(1.3, floor - 1) * (isBoss ? 6 : 1));
}

export function xpPerKill(floor: number, index: number): number {
  const isBoss = index >= GAME.MONSTERS_PER_FLOOR - 1;
  return Math.ceil(8 * Math.pow(1.25, floor - 1) * (isBoss ? 5 : 1));
}

export function isBossIndex(index: number): boolean {
  return index >= GAME.MONSTERS_PER_FLOOR - 1;
}

// Coût de la prochaine amélioration (croissance exponentielle).
const UPGRADE_BASE_COST: Record<Stat, number> = {
  atk: 50,
  maxHp: 40,
  regen: 60,
  crit: 120,
};

export function upgradeCost(state: GameState, stat: Stat): number {
  const lvl = state.upgrades[stat] || 0;
  return Math.ceil(UPGRADE_BASE_COST[stat] * Math.pow(1.18, lvl));
}

// ---- Simulation des gains hors-ligne ----
// On estime un régime permanent au farm de l'étage courant (index 0),
// sans faire progresser l'étage (volontairement prudent).
export interface OfflineResult {
  seconds: number;
  gold: number;
  xp: number;
}

export function simulateOffline(state: GameState, elapsedSec: number): OfflineResult {
  const capped = Math.min(Math.max(0, elapsedSec), GAME.OFFLINE_CAP_SEC);
  const dps = heroDps(state);
  const mHp = monsterMaxHp(state.floor, 0);
  const timeToKill = Math.max(0.4, mHp / Math.max(1, dps));
  const killsPerSec = 1 / timeToKill;

  const gold = Math.floor(killsPerSec * goldPerKill(state.floor, 0) * capped);
  const xp = Math.floor(killsPerSec * xpPerKill(state.floor, 0) * capped);
  return { seconds: capped, gold, xp };
}
