import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GameState, Stat, ClassId, VoieId, ClaimEntry } from './types';
import { GAME, COMPANIONS, TALENTS, VOIES, BODY_STEP, levelFromXp } from './config';
import {
  derive, monsterMaxHp, monsterAtk, goldPerKill, xpPerKill, isBoss,
  compCost, talCost, upgradeCost, simulateOffline, OfflineResult,
} from './engine';

// ---- Helpers date ----
export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function prevDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return dayKey(dt);
}

function initialState(): GameState {
  return {
    gold: 0, gems: 0, xp: 0, level: 1, cls: null,
    habitStats: { atk: 0, maxHp: 0, regen: 0, crit: 0, click: 0 },
    upgrades: { atk: 0, maxHp: 0, regen: 0, crit: 0, click: 0 },
    talents: {}, companions: {},
    floor: 1, monsterIndex: 0, monsterHp: monsterMaxHp(1, 0), heroHp: GAME.BASE.maxHp,
    todayDate: dayKey(), todayLog: [], streak: 0, lastCheckinDate: null, buffUntil: 0,
    body: null,
    dungeonLog: ['✨ Ton héros pénètre dans le donjon…'],
    totalDmg: 0, kills: 0, bestFloor: 1,
    notificationsEnabled: false, reminderHour: 20,
    lastActive: Date.now(),
  };
}

export interface TapResult { amount: number; crit: boolean; killed: boolean; boss: boolean; leveled: boolean; }
export interface WeighResult { gold: number; gems: number; elan: boolean; chapterUp: boolean; chapter: number; }

export interface Actions {
  init: () => OfflineResult | null;
  tick: () => void;
  tapMonster: () => TapResult;
  buyUpgrade: (stat: Stat) => boolean;
  buyCompanion: (id: string, amount: number) => boolean;
  buyTalent: (id: string) => boolean;
  setClass: (id: ClassId) => void;
  claimCheckin: (entries: ClaimEntry[]) => { xp: number; gold: number; gems: number } | null;
  setVoie: (voie: VoieId, weight: number) => void;
  weighIn: (w: number) => WeighResult | null;
  setNotifications: (enabled: boolean, hour: number) => void;
  resetGame: () => void;
}
export type Store = GameState & Actions;

function pushLog(log: string[], s: string): string[] {
  return [s, ...log].slice(0, GAME.MAX_LOG);
}

export const useGame = create<Store>()(
  persist(
    (set, get) => {
      // Applique des dégâts au monstre, gère mort / niveau / étage.
      function damage(amount: number): { killed: boolean; boss: boolean; leveled: boolean } {
        const s = get();
        const d = derive(s);
        let mhp = s.monsterHp - amount;
        const totalDmg = s.totalDmg + amount;
        if (mhp > 0) {
          set({ monsterHp: mhp, totalDmg });
          return { killed: false, boss: false, leveled: false };
        }
        // Monstre vaincu
        const boss = isBoss(s.monsterIndex);
        const oldLevel = s.level;
        const gold = s.gold + Math.round(goldPerKill(s.floor, s.monsterIndex) * d.goldMult);
        const xp = s.xp + xpPerKill(s.floor, s.monsterIndex);
        const level = levelFromXp(xp);
        let gems = s.gems + (level > oldLevel ? level - oldLevel : 0);
        let floor = s.floor, mi = s.monsterIndex, log = s.dungeonLog, bestFloor = s.bestFloor;
        if (boss) {
          const gem = 1 + Math.floor(s.floor / 2);
          gems += gem;
          log = pushLog(log, `👑 Boss étage ${s.floor} vaincu ! +${gem} 💎, descente étage ${s.floor + 1}.`);
          floor = s.floor + 1; mi = 0; bestFloor = Math.max(bestFloor, floor);
        } else {
          mi = s.monsterIndex + 1;
          log = pushLog(log, `⚔️ Monstre vaincu (+${goldPerKill(s.floor, s.monsterIndex)} or).`);
        }
        if (level > oldLevel) log = pushLog(log, `⭐ Niveau ${level} atteint ! +${level - oldLevel} 💎`);
        const maxHp = d.maxHp;
        set({
          gold, xp, level, gems, floor, monsterIndex: mi, bestFloor,
          monsterHp: monsterMaxHp(floor, mi),
          heroHp: Math.min(maxHp, s.heroHp + maxHp * 0.15),
          totalDmg, kills: s.kills + 1, dungeonLog: log,
        });
        return { killed: true, boss, leveled: level > oldLevel };
      }

      return {
        ...initialState(),

        init: () => {
          const s = get();
          const patch: Partial<GameState> = {};
          const today = dayKey();
          if (s.todayDate !== today) { patch.todayLog = []; patch.todayDate = today; }
          const elapsed = (Date.now() - s.lastActive) / 1000;
          let off: OfflineResult | null = null;
          if (elapsed > 60) {
            off = simulateOffline(s, elapsed);
            if (off.gold > 0 || off.xp > 0) {
              const xp = s.xp + off.xp;
              patch.gold = s.gold + off.gold;
              patch.xp = xp;
              patch.level = levelFromXp(xp);
            } else off = null;
          }
          patch.lastActive = Date.now();
          set(patch);
          return off;
        },

        tick: () => {
          const s = get();
          const d = derive(s);
          const dt = GAME.TICK_MS / 1000;
          const gold = s.gold + d.goldSec * dt;
          let hp = Math.min(d.maxHp, s.heroHp + d.regen * dt) - monsterAtk(s.floor, s.monsterIndex) * dt;
          if (hp <= 0) {
            set({
              gold, heroHp: d.maxHp, monsterHp: monsterMaxHp(s.floor, s.monsterIndex),
              dungeonLog: pushLog(s.dungeonLog, `💀 Héros terrassé étage ${s.floor}, il se relève !`),
              lastActive: Date.now(),
            });
            return;
          }
          set({ gold, heroHp: hp, lastActive: Date.now() });
          damage(d.dps * dt);
        },

        tapMonster: () => {
          const s = get();
          const d = derive(s);
          const crit = Math.random() * 100 < d.crit;
          const amount = d.clickDmg * (crit ? GAME.CRIT_MULT : 1);
          const r = damage(amount);
          return { amount, crit, killed: r.killed, boss: r.boss, leveled: r.leveled };
        },

        buyUpgrade: (stat) => {
          const s = get();
          const cost = upgradeCost(s, stat);
          if (s.gold < cost) return false;
          set({ gold: s.gold - cost, upgrades: { ...s.upgrades, [stat]: (s.upgrades[stat] || 0) + 1 } });
          return true;
        },

        buyCompanion: (id, amount) => {
          const s = get();
          const cp = COMPANIONS.find((c) => c.id === id);
          if (!cp) return false;
          const have = s.companions[id] || 0;
          let cost = 0;
          for (let k = 0; k < amount; k++) cost += compCost(cp.base, have + k);
          if (s.gold < cost) return false;
          set({ gold: s.gold - cost, companions: { ...s.companions, [id]: have + amount } });
          return true;
        },

        buyTalent: (id) => {
          const s = get();
          const t = TALENTS.find((x) => x.id === id);
          if (!t) return false;
          const lvl = s.talents[id] || 0;
          const cost = talCost(t.base, lvl);
          if (lvl >= t.max || s.gems < cost) return false;
          set({ gems: s.gems - cost, talents: { ...s.talents, [id]: lvl + 1 } });
          return true;
        },

        setClass: (id) => {
          const s = get();
          if (s.cls === id) return;
          if (s.cls && s.gems < 5) return;
          set({ cls: id, gems: s.cls ? s.gems - 5 : s.gems });
        },

        claimCheckin: (entries) => {
          const s = get();
          const today = dayKey();
          if (s.lastCheckinDate === today || entries.length === 0) return null;
          let todayLog = s.todayLog;
          if (s.todayDate !== today) todayLog = [];
          const streak = s.lastCheckinDate === prevDayKey(today) ? s.streak + 1 : 1;
          let addXp = 0, addGold = 0, hpHeal = 0;
          const habitStats = { ...s.habitStats };
          const logs = todayLog.slice();
          for (const e of entries) {
            addXp += e.xp; addGold += e.gold;
            habitStats[e.stat] = (habitStats[e.stat] || 0) + e.statGain;
            if (e.stat === 'maxHp') hpHeal += e.statGain;
            logs.unshift({ emoji: e.emoji, label: e.label, xp: e.xp, gold: e.gold, ts: Date.now() });
          }
          const xp = s.xp + addXp;
          set({
            xp, level: levelFromXp(xp), gold: s.gold + addGold, gems: s.gems + 3,
            habitStats, heroHp: s.heroHp + hpHeal, todayLog: logs, todayDate: today,
            streak, lastCheckinDate: today, buffUntil: Date.now() + 24 * 3600 * 1000,
          });
          return { xp: addXp, gold: addGold, gems: 3 };
        },

        setVoie: (voie, weight) => {
          const s = get();
          const dir = VOIES[voie].dir;
          const w = s.body ? s.body.weight : weight;
          const target = dir === 'perte' ? w - BODY_STEP : dir === 'prise' ? w + BODY_STEP : w;
          set({
            body: {
              voie, dir, weight: w, start: w, anchor: w, target,
              chapter: s.body ? s.body.chapter : 1,
              chapters: s.body ? s.body.chapters : 0,
              history: s.body ? s.body.history : [{ ts: Date.now(), w }],
              lastWeighIn: Date.now(),
              elanUntil: s.body ? s.body.elanUntil : 0,
            },
          });
        },

        weighIn: (w) => {
          const s = get();
          if (!s.body) return null;
          const B = s.body;
          const now = Date.now();
          const history = [...B.history, { ts: now, w }].slice(-80);
          const toward = B.dir === 'perte' ? w < B.weight : B.dir === 'prise' ? w > B.weight : Math.abs(w - B.anchor) <= 1;
          const reached = B.dir === 'perte' ? w <= B.target : B.dir === 'prise' ? w >= B.target : Math.abs(w - B.anchor) <= 1;
          let gold = 200 * B.chapter, gems = 1, elan = false, chapterUp = false;
          let chapter = B.chapter, chapters = B.chapters, start = B.start, target = B.target, anchor = B.anchor;
          if (toward) { elan = true; gold += 400 * B.chapter; }
          if (reached) {
            chapterUp = true; chapters += 1; chapter += 1;
            gems += 3 + chapters; gold += 1500 * chapter;
            start = w;
            if (B.dir === 'perte') target = w - BODY_STEP;
            else if (B.dir === 'prise') target = w + BODY_STEP;
            else anchor = w;
          }
          set({
            gold: s.gold + gold, gems: s.gems + gems,
            body: { ...B, weight: w, history, lastWeighIn: now, elanUntil: elan ? now + 24 * 3600 * 1000 : B.elanUntil, chapter, chapters, start, target, anchor },
          });
          return { gold, gems, elan, chapterUp, chapter };
        },

        setNotifications: (enabled, hour) =>
          set({ notificationsEnabled: enabled, reminderHour: Math.max(0, Math.min(23, hour)) }),

        resetGame: () => set({ ...initialState() }),
      };
    },
    {
      name: 'habitquest-rn-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ init, tick, tapMonster, buyUpgrade, buyCompanion, buyTalent, setClass, claimCheckin, setVoie, weighIn, setNotifications, resetGame, ...rest }: any) => rest,
    },
  ),
);
