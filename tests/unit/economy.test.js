import { describe, it, expect, beforeEach } from 'vitest';
import { COLS, ROWS } from '../../src/core/util.js';
import { newGame, S } from '../../src/core/state.js';
import { build, upgrade, sell, canBuild } from '../../src/core/actions.js';
import { tcost, ucost, sellRate } from '../../src/core/stats.js';

function freeTile() {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (canBuild(c, r)) return [c, r];
  throw new Error('no free tile');
}

describe('build, upgrade, sell', () => {
  beforeEach(() => newGame(0, 'endless'));

  it('building takes the tower cost and occupies the tile', () => {
    const [c, r] = freeTile(), gold = S.gold;
    expect(build('laser', c, r)).toBe(true);
    expect(S.gold).toBe(gold - tcost('laser'));
    expect(S.towers).toHaveLength(1);
    expect(canBuild(c, r)).toBe(false);
    expect(build('laser', c, r)).toBe(false);
  });

  it('cannot build on the path or without credits', () => {
    const [pc, pr] = [S.map.routes[0].pts[1][0], S.map.routes[0].pts[1][1]];
    expect(build('laser', pc, pr)).toBe(false);
    S.gold = 0;
    const [c, r] = freeTile();
    expect(build('laser', c, r)).toBe(false);
  });

  it('upgrades through three levels, then needs a specialization', () => {
    S.gold = 10000;
    const [c, r] = freeTile();
    build('cannon', c, r);
    const t = S.towers[0];
    for (const lvl of [2, 3]) {
      const gold = S.gold, cost = ucost(t);
      expect(upgrade(t)).toBe(true);
      expect(t.lvl).toBe(lvl);
      expect(S.gold).toBe(gold - cost);
    }
    expect(upgrade(t)).toBe(false);
    expect(upgrade(t, 'A')).toBe(true);
    expect(t.br).toBe('A');
  });

  it('selling refunds part of everything spent on the tower', () => {
    S.gold = 10000;
    const [c, r] = freeTile();
    build('laser', c, r);
    const t = S.towers[0];
    upgrade(t);
    const gold = S.gold;
    sell(t);
    expect(S.towers).toHaveLength(0);
    expect(S.gold).toBe(gold + Math.floor(t.spent * sellRate()));
  });
});
