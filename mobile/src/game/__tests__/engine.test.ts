import { derive, fmt, monsterMaxHp, monsterAtk, goldPerKill, isBoss, upgradeCost, compCost, talCost, simulateOffline, reliquesGain } from '../engine';
import { GAME, xpForLevel, levelFromXp } from '../config';
import { GameState } from '../types';

function makeState(over: Partial<GameState> = {}): GameState {
  return {
    gold: 0, gems: 0, reliques: 0, xp: 0, level: 1, cls: 'guerrier',
    habitStats: { atk: 0, maxHp: 0, regen: 0, crit: 0, click: 0 },
    upgrades: { atk: 0, maxHp: 0, regen: 0, crit: 0, click: 0 },
    talents: {}, companions: {},
    floor: 1, monsterIndex: 0, monsterHp: 30, heroHp: 60,
    todayDate: '2026-01-01', todayLog: [], streak: 0, lastCheckinDate: null, buffUntil: 0,
    body: null, dungeonLog: [], totalDmg: 0, kills: 0, bestFloor: 1,
    notificationsEnabled: false, reminderHour: 20, lastActive: 0,
    ...over,
  };
}

describe('courbe de niveaux', () => {
  it('xpForLevel croissante', () => {
    for (let l = 1; l < 30; l++) expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
  });
  it('levelFromXp cohérente', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(xpForLevel(5))).toBe(5);
    expect(levelFromXp(xpForLevel(5) - 1)).toBe(4);
  });
});

describe('stats dérivées', () => {
  it('DPS augmente avec l’attaque (habitudes)', () => {
    const base = derive(makeState());
    const strong = derive(makeState({ habitStats: { atk: 30, maxHp: 0, regen: 0, crit: 0, click: 0 } }));
    expect(base.dps).toBeGreaterThan(0);
    expect(strong.dps).toBeGreaterThan(base.dps);
  });
  it('le Mage frappe plus fort au clic que le Guerrier', () => {
    const g = derive(makeState({ cls: 'guerrier' }));
    const m = derive(makeState({ cls: 'mage' }));
    expect(m.clickDmg).toBeGreaterThan(g.clickDmg);
  });
  it('les compagnons génèrent de l’or/sec', () => {
    const none = derive(makeState());
    const withComp = derive(makeState({ companions: { torche: 10 } }));
    expect(none.goldSec).toBe(0);
    expect(withComp.goldSec).toBeGreaterThan(0);
  });
  it('la Bénédiction (buff) et l’Élan multiplient les dégâts', () => {
    const plain = derive(makeState());
    const buffed = derive(makeState({ buffUntil: Date.now() + 100000 }));
    expect(buffed.dps).toBeGreaterThan(plain.dps);
  });
  it('les reliques (prestige) boostent dégâts et or', () => {
    const plain = derive(makeState());
    const reborn = derive(makeState({ reliques: 10 }));
    expect(reborn.dps).toBeGreaterThan(plain.dps);
    expect(reborn.goldMult).toBeGreaterThan(plain.goldMult);
  });
  it('le gain de reliques augmente avec l’étage', () => {
    expect(reliquesGain(4)).toBe(0);
    expect(reliquesGain(20)).toBeGreaterThan(reliquesGain(10));
  });
  it('les paliers d’objectif donnent un bonus permanent', () => {
    const b = (chapters: number) => derive(makeState({
      body: { voie: 'force', dir: 'prise', weight: 80, start: 80, anchor: 80, target: 81, chapter: 1, chapters, history: [], lastWeighIn: 0, elanUntil: 0 },
    }));
    expect(b(5).maxHp).toBeGreaterThan(b(0).maxHp);
  });
});

describe('monstres & coûts', () => {
  it('PV montent avec l’étage, boss plus coriace', () => {
    expect(monsterMaxHp(2, 0)).toBeGreaterThan(monsterMaxHp(1, 0));
    const boss = GAME.MPF - 1;
    expect(isBoss(boss)).toBe(true);
    expect(monsterMaxHp(1, boss)).toBeGreaterThan(monsterMaxHp(1, 0));
    expect(monsterAtk(1, boss)).toBeGreaterThan(monsterAtk(1, 0));
    expect(goldPerKill(1, boss)).toBeGreaterThan(goldPerKill(1, 0));
  });
  it('les coûts augmentent avec le niveau', () => {
    expect(upgradeCost(makeState({ upgrades: { atk: 3, maxHp: 0, regen: 0, crit: 0, click: 0 } }), 'atk'))
      .toBeGreaterThan(upgradeCost(makeState(), 'atk'));
    expect(compCost(15, 10)).toBeGreaterThan(compCost(15, 0));
    expect(talCost(2, 5)).toBeGreaterThan(talCost(2, 0));
  });
});

describe('hors-ligne & format', () => {
  it('gains hors-ligne plafonnés et non nuls', () => {
    const r = simulateOffline(makeState(), 999999);
    expect(r.seconds).toBe(8 * 3600);
    expect(r.gold).toBeGreaterThan(0);
  });
  it('fmt formate les grands nombres', () => {
    expect(fmt(999)).toBe('999');
    expect(fmt(1234)).toBe('1.23K');
    expect(fmt(1234567)).toBe('1.23M');
  });
});
