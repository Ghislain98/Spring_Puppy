import { GameState, Stat } from './types';
import { GAME, CLASSES, COMPANIONS } from './config';

const { MPF, CRIT_MULT, BASE, UP_GAIN, UP_BASE } = GAME;

// ---- Formatage des grands nombres (1.2K, 3.4M…) ----
export function fmt(n: number): string {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  const u = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
  let i = -1;
  while (n >= 1000 && i < u.length - 1) {
    n /= 1000;
    i++;
  }
  return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) + u[i];
}

// ---- Monstres ----
export const isBoss = (i: number): boolean => i >= MPF - 1;
export const monsterMaxHp = (f: number, i: number): number =>
  Math.ceil(30 * Math.pow(1.35, f - 1) * (1 + i * 0.12) * (isBoss(i) ? 4 : 1));
export const monsterAtk = (f: number, i: number): number =>
  Math.ceil(3 * Math.pow(1.28, f - 1) * (isBoss(i) ? 2.2 : 1));
export const goldPerKill = (f: number, i: number): number =>
  Math.ceil(6 * Math.pow(1.3, f - 1) * (isBoss(i) ? 6 : 1));
export const xpPerKill = (f: number, i: number): number =>
  Math.ceil(8 * Math.pow(1.25, f - 1) * (isBoss(i) ? 5 : 1));

// ---- Coûts ----
export const compCost = (base: number, count: number): number => Math.ceil(base * Math.pow(1.15, count));
export const talCost = (base: number, lvl: number): number => Math.ceil(base * Math.pow(1.6, lvl));
export const upgradeCost = (s: GameState, stat: Stat): number =>
  Math.ceil(UP_BASE[stat] * Math.pow(1.18, s.upgrades[stat] || 0));

export const buffOn = (s: GameState): boolean => s.buffUntil > Date.now();
export const elanOn = (s: GameState): boolean => !!(s.body && s.body.elanUntil > Date.now());

// ---- Stats dérivées ----
export interface Derived {
  dmgMult: number;
  goldMult: number;
  crit: number;
  atk: number;
  maxHp: number;
  regen: number;
  dps: number;
  clickDmg: number;
  goldSec: number;
  offCap: number;
}

export function derive(s: GameState): Derived {
  const c = CLASSES[s.cls || 'guerrier'];
  const T = s.talents;
  const b = (buffOn(s) ? 1.5 : 1) * (elanOn(s) ? 2 : 1);

  const ch = (s.body && s.body.chapters) || 0;
  const voie = s.body && s.body.voie;
  let vDmg = 1, vGold = 1, vHp = 1, vCrit = 0, vClick = 1;
  if (voie === 'agilite') { vDmg = 1 + 0.02 * ch; vCrit = Math.min(15, ch); vClick = 1.4; }
  else if (voie === 'force') { vHp = 1 + 0.05 * ch; vDmg = 1 + 0.03 * ch; }
  else if (voie === 'equilibre') { vGold = 1 + 0.04 * ch; vDmg = 1 + 0.01 * ch; }

  const dmgMult = c.dmg * (1 + 0.25 * (T.force || 0)) * b * vDmg;
  const goldMult = c.gold * (1 + 0.25 * (T.cupidite || 0)) * b * vGold;
  const crit = Math.min(75, BASE.crit + c.crit + 5 * (T.precision || 0) + (s.upgrades.crit || 0) * UP_GAIN.crit + vCrit);
  const critF = 1 + (crit / 100) * (CRIT_MULT - 1);
  const atk = BASE.atk + s.habitStats.atk + (s.upgrades.atk || 0) * UP_GAIN.atk;
  const maxHp = (BASE.maxHp + s.habitStats.maxHp + (s.upgrades.maxHp || 0) * UP_GAIN.maxHp) * c.hp * vHp;
  const regen = (BASE.regen + s.habitStats.regen + (s.upgrades.regen || 0) * UP_GAIN.regen) * c.regen;
  const dps = atk * critF * dmgMult;
  const clickBase = 2 + s.level + (s.upgrades.click || 0) * 3;
  const clickDmg = clickBase * dmgMult * c.click * vClick * (1 + 1.2 * (T.frappe || 0));
  const compMult = (1 + 0.2 * (T.tresorier || 0)) * goldMult;
  const goldSec = COMPANIONS.reduce((a, cp) => a + (s.companions[cp.id] || 0) * cp.rate, 0) * compMult;
  const offCap = (8 + 2 * (T.souffle || 0)) * 3600;

  return { dmgMult, goldMult, crit, atk, maxHp, regen, dps, clickDmg, goldSec, offCap };
}

export interface OfflineResult {
  seconds: number;
  gold: number;
  xp: number;
}
export function simulateOffline(s: GameState, elapsedSec: number): OfflineResult {
  const d = derive(s);
  const cap = Math.min(Math.max(0, elapsedSec), d.offCap);
  const kps = d.dps / monsterMaxHp(s.floor, 0);
  const gold = Math.floor((kps * goldPerKill(s.floor, 0) * d.goldMult + d.goldSec) * cap);
  const xp = Math.floor(kps * xpPerKill(s.floor, 0) * cap);
  return { seconds: cap, gold, xp };
}
