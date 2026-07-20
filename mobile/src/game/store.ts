import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GameState, Stat, DungeonLogEntry, LoggedHabit, HabitPreset, ClaimEntry } from './types';
import { GAME, levelFromXp } from './config';
import {
  effectiveStat,
  heroDps,
  monsterMaxHp,
  monsterAtk,
  goldPerKill,
  xpPerKill,
  isBossIndex,
  upgradeCost,
  simulateOffline,
  OfflineResult,
} from './engine';

// ---------- Helpers date ----------
export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function prevDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return dayKey(dt);
}

let logCounter = 0;
function makeLog(kind: DungeonLogEntry['kind'], text: string): DungeonLogEntry {
  logCounter += 1;
  return { id: `${Date.now()}-${logCounter}`, ts: Date.now(), kind, text };
}

// ---------- État initial ----------
function initialState(): GameState {
  return {
    gold: 0,
    xp: 0,
    level: 1,
    habitStats: { atk: 0, maxHp: 0, regen: 0, crit: 0 },
    upgrades: { atk: 0, maxHp: 0, regen: 0, crit: 0 },
    floor: 1,
    monsterIndex: 0,
    monsterHp: monsterMaxHp(1, 0),
    heroHp: GAME.BASE.maxHp,
    todayDate: dayKey(),
    todayLog: [],
    history: {},
    dungeonLog: [makeLog('loot', "Ton héros entre dans le donjon…")],
    streak: 0,
    lastCheckinDate: null,
    customHabits: [],
    notificationsEnabled: false,
    reminderHour: 20,
    totalHabits: 0,
    bestFloor: 1,
    lastActive: Date.now(),
  };
}

// ---------- Store ----------
export interface GameActions {
  init: () => OfflineResult | null;
  claimCheckin: (entries: ClaimEntry[]) => boolean;
  buyUpgrade: (stat: Stat) => boolean;
  tick: () => void;
  resetGame: () => void;
  addCustomHabit: (h: Omit<HabitPreset, 'id'>) => void;
  removeCustomHabit: (id: string) => void;
  setNotifications: (enabled: boolean, hour: number) => void;
}

export type Store = GameState & GameActions;

function pushDungeonLog(log: DungeonLogEntry[], entry: DungeonLogEntry): DungeonLogEntry[] {
  return [entry, ...log].slice(0, GAME.MAX_DUNGEON_LOG);
}

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState(),

      // Appelé au démarrage : reset quotidien + gains hors-ligne.
      init: () => {
        const s = get();
        let patch: Partial<GameState> = {};

        // Reset quotidien du journal si on a changé de jour.
        const today = dayKey();
        if (s.todayDate !== today) {
          const history = { ...s.history };
          if (s.todayLog.length > 0) history[s.todayDate] = s.todayLog.length;
          patch.history = history;
          patch.todayLog = [];
          patch.todayDate = today;
        }

        // Gains hors-ligne.
        const elapsed = (Date.now() - s.lastActive) / 1000;
        let offline: OfflineResult | null = null;
        if (elapsed > 60) {
          offline = simulateOffline(s, elapsed);
          if (offline.gold > 0 || offline.xp > 0) {
            const newXp = s.xp + offline.xp;
            patch.gold = s.gold + offline.gold;
            patch.xp = newXp;
            patch.level = levelFromXp(newXp);
            const mins = Math.floor(offline.seconds / 60);
            const label = mins >= 60 ? `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}` : `${mins} min`;
            patch.dungeonLog = pushDungeonLog(
              s.dungeonLog,
              makeLog('offline', `Absence ${label} : +${offline.gold} or, +${offline.xp} XP récoltés.`),
            );
          }
        }

        patch.lastActive = Date.now();
        set(patch);
        return offline;
      },

      // Encaisse le check-in du jour : applique XP, or et boosts de stats en une
      // fois. Verrouillé à un check-in validé par jour.
      claimCheckin: (entries: ClaimEntry[]) => {
        const s = get();
        const today = dayKey();
        if (s.lastCheckinDate === today) return false; // déjà fait aujourd'hui
        if (entries.length === 0) return false;

        // Bascule de jour du journal si nécessaire.
        let history = s.history;
        let todayLog = s.todayLog;
        if (s.todayDate !== today) {
          history = { ...history };
          if (todayLog.length > 0) history[s.todayDate] = todayLog.length;
          todayLog = [];
        }

        // Streak : +1 si check-in fait hier, sinon repart à 1.
        const streak = s.lastCheckinDate === prevDayKey(today) ? s.streak + 1 : 1;

        // Cumul des récompenses.
        let addXp = 0;
        let addGold = 0;
        let hpHeal = 0;
        const habitStats = { ...s.habitStats };
        const logs: LoggedHabit[] = [];
        for (const e of entries) {
          addXp += e.xp;
          addGold += e.gold;
          habitStats[e.stat] = (habitStats[e.stat] || 0) + e.statGain;
          if (e.stat === 'maxHp') hpHeal += e.statGain;
          logs.push({
            presetId: 'checkin',
            category: e.category,
            label: e.label,
            emoji: e.emoji,
            xp: e.xp,
            gold: e.gold,
            ts: Date.now(),
          });
        }

        const newXp = s.xp + addXp;
        set({
          xp: newXp,
          level: levelFromXp(newXp),
          gold: s.gold + addGold,
          habitStats,
          heroHp: s.heroHp + hpHeal,
          todayLog: [...logs, ...todayLog],
          history,
          streak,
          lastCheckinDate: today,
          todayDate: today,
          totalHabits: s.totalHabits + entries.length,
        });
        return true;
      },

      buyUpgrade: (stat: Stat) => {
        const s = get();
        const cost = upgradeCost(s, stat);
        if (s.gold < cost) return false;
        const upgrades = { ...s.upgrades, [stat]: (s.upgrades[stat] || 0) + 1 };
        set({ gold: s.gold - cost, upgrades });
        return true;
      },

      // Un tick de combat (≈ 1 seconde).
      tick: () => {
        const s = get();
        const dps = heroDps(s);
        const maxHp = effectiveStat(s, 'maxHp');
        const regen = effectiveStat(s, 'regen');
        const mAtk = monsterAtk(s.floor, s.monsterIndex);

        // Échange de coups sur la seconde.
        let heroHp = Math.min(maxHp, s.heroHp + regen) - mAtk;
        let monsterHp = s.monsterHp - dps;

        // Défaite : le héros est réanimé, le combat courant repart.
        if (heroHp <= 0) {
          set({
            heroHp: maxHp,
            monsterHp: monsterMaxHp(s.floor, s.monsterIndex),
            lastActive: Date.now(),
            dungeonLog: pushDungeonLog(
              s.dungeonLog,
              makeLog('defeat', `Étage ${s.floor} : héros terrassé, il se relève !`),
            ),
          });
          return;
        }

        // Monstre encore vivant.
        if (monsterHp > 0) {
          set({ heroHp, monsterHp, lastActive: Date.now() });
          return;
        }

        // Monstre vaincu -> récompenses.
        const boss = isBossIndex(s.monsterIndex);
        const gold = s.gold + goldPerKill(s.floor, s.monsterIndex);
        const gainedXp = xpPerKill(s.floor, s.monsterIndex);
        const newXp = s.xp + gainedXp;

        let floor = s.floor;
        let monsterIndex = s.monsterIndex;
        let dungeonLog = s.dungeonLog;

        if (boss) {
          floor = s.floor + 1;
          monsterIndex = 0;
          dungeonLog = pushDungeonLog(
            dungeonLog,
            makeLog('boss', `👑 Boss de l'étage ${s.floor} vaincu ! Descente à l'étage ${floor}.`),
          );
        } else {
          monsterIndex = s.monsterIndex + 1;
          dungeonLog = pushDungeonLog(
            dungeonLog,
            makeLog('kill', `Monstre vaincu (+${goldPerKill(s.floor, s.monsterIndex)} or).`),
          );
        }

        set({
          gold,
          xp: newXp,
          level: levelFromXp(newXp),
          floor,
          monsterIndex,
          monsterHp: monsterMaxHp(floor, monsterIndex),
          heroHp: Math.min(maxHp, heroHp),
          bestFloor: Math.max(s.bestFloor, floor),
          dungeonLog,
          lastActive: Date.now(),
        });
      },

      resetGame: () => set({ ...initialState() }),

      addCustomHabit: (h) => {
        const s = get();
        const habit: HabitPreset = { ...h, id: `custom_${Date.now()}` };
        set({ customHabits: [...s.customHabits, habit] });
      },

      removeCustomHabit: (id) => {
        const s = get();
        set({ customHabits: s.customHabits.filter((h: HabitPreset) => h.id !== id) });
      },

      setNotifications: (enabled, hour) =>
        set({ notificationsEnabled: enabled, reminderHour: Math.max(0, Math.min(23, hour)) }),
    }),
    {
      name: 'habitquest-save-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        init,
        claimCheckin,
        buyUpgrade,
        tick,
        resetGame,
        addCustomHabit,
        removeCustomHabit,
        setNotifications,
        ...rest
      }: any) => rest,
    },
  ),
);
