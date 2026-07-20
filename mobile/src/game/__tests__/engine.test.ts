import {
  effectiveStat,
  heroDps,
  monsterMaxHp,
  monsterAtk,
  goldPerKill,
  isBossIndex,
  upgradeCost,
  simulateOffline,
} from '../engine';
import { GAME, xpForLevel, levelFromXp } from '../config';
import { GameState } from '../types';

// Construit un état de jeu minimal, surchargeable pour les tests.
function makeState(over: Partial<GameState> = {}): GameState {
  return {
    gold: 0,
    xp: 0,
    level: 1,
    habitStats: { atk: 0, maxHp: 0, regen: 0, crit: 0 },
    upgrades: { atk: 0, maxHp: 0, regen: 0, crit: 0 },
    floor: 1,
    monsterIndex: 0,
    monsterHp: 30,
    heroHp: 60,
    todayDate: '2026-01-01',
    todayLog: [],
    history: {},
    dungeonLog: [],
    streak: 0,
    lastHabitDate: null,
    customHabits: [],
    dailyGoal: 0,
    notificationsEnabled: false,
    reminderHour: 20,
    totalHabits: 0,
    bestFloor: 1,
    lastActive: 0,
    ...over,
  };
}

describe('courbe de niveaux', () => {
  it('xpForLevel est croissante', () => {
    for (let l = 1; l < 30; l++) {
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
    }
  });

  it('levelFromXp est cohérente avec xpForLevel', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(xpForLevel(5))).toBe(5);
    expect(levelFromXp(xpForLevel(5) - 1)).toBe(4);
  });
});

describe('stats effectives', () => {
  it('additionne base + habitudes + améliorations', () => {
    const s = makeState({
      habitStats: { atk: 10, maxHp: 0, regen: 0, crit: 0 },
      upgrades: { atk: 2, maxHp: 0, regen: 0, crit: 0 },
    });
    // base atk (4) + habit (10) + 2 * gain d'amélioration (3) = 20
    expect(effectiveStat(s, 'atk')).toBe(GAME.BASE.atk + 10 + 2 * 3);
  });

  it('le DPS augmente avec attaque et critique', () => {
    const base = makeState();
    const strong = makeState({ habitStats: { atk: 20, maxHp: 0, regen: 0, crit: 0 } });
    const critty = makeState({ habitStats: { atk: 0, maxHp: 0, regen: 0, crit: 40 } });
    expect(heroDps(strong)).toBeGreaterThan(heroDps(base));
    expect(heroDps(critty)).toBeGreaterThan(heroDps(base));
  });
});

describe('mise à l’échelle des monstres', () => {
  it('les PV augmentent avec l’étage', () => {
    expect(monsterMaxHp(2, 0)).toBeGreaterThan(monsterMaxHp(1, 0));
  });

  it('le boss (dernier index) est plus coriace qu’un monstre normal', () => {
    const bossIdx = GAME.MONSTERS_PER_FLOOR - 1;
    expect(isBossIndex(bossIdx)).toBe(true);
    expect(isBossIndex(0)).toBe(false);
    expect(monsterMaxHp(1, bossIdx)).toBeGreaterThan(monsterMaxHp(1, 0));
    expect(monsterAtk(1, bossIdx)).toBeGreaterThan(monsterAtk(1, 0));
    expect(goldPerKill(1, bossIdx)).toBeGreaterThan(goldPerKill(1, 0));
  });
});

describe('coût des améliorations', () => {
  it('augmente avec le niveau déjà acheté', () => {
    const s0 = makeState();
    const s3 = makeState({ upgrades: { atk: 3, maxHp: 0, regen: 0, crit: 0 } });
    expect(upgradeCost(s3, 'atk')).toBeGreaterThan(upgradeCost(s0, 'atk'));
  });
});

describe('gains hors-ligne', () => {
  it('sont nuls sans temps écoulé', () => {
    const r = simulateOffline(makeState(), 0);
    expect(r.gold).toBe(0);
    expect(r.xp).toBe(0);
  });

  it('sont plafonnés à la limite hors-ligne', () => {
    const huge = simulateOffline(makeState(), GAME.OFFLINE_CAP_SEC * 10);
    expect(huge.seconds).toBe(GAME.OFFLINE_CAP_SEC);
    expect(huge.gold).toBeGreaterThan(0);
  });

  it('un héros plus fort récolte plus vite', () => {
    const weak = simulateOffline(makeState(), 3600);
    const strong = simulateOffline(
      makeState({ habitStats: { atk: 50, maxHp: 0, regen: 0, crit: 0 } }),
      3600,
    );
    expect(strong.gold).toBeGreaterThan(weak.gold);
  });
});
