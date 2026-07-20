import { evaluate, ACHIEVEMENTS } from '../achievements';
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
    unlocked: [], unlockQueue: [],
    notificationsEnabled: false, reminderHour: 20, lastActive: 0,
    ...over,
  };
}

describe('succès', () => {
  it('aucun succès au départ', () => {
    expect(evaluate(makeState()).ids).toHaveLength(0);
  });
  it('atteindre l’étage 5 débloque un succès et crédite des gemmes', () => {
    const r = evaluate(makeState({ bestFloor: 5 }));
    expect(r.ids).toContain('floor5');
    expect(r.gems).toBeGreaterThan(0);
  });
  it('ne redébloque pas un succès déjà obtenu', () => {
    expect(evaluate(makeState({ bestFloor: 5, unlocked: ['floor5'] })).ids).not.toContain('floor5');
  });
  it('un streak de 7 débloque les paliers 3 et 7', () => {
    const ids = evaluate(makeState({ streak: 7 })).ids;
    expect(ids).toEqual(expect.arrayContaining(['streak3', 'streak7']));
  });
  it('tous les succès ont une récompense', () => {
    for (const a of ACHIEVEMENTS) expect((a.gems ?? 0) + (a.reliques ?? 0)).toBeGreaterThan(0);
  });
});
