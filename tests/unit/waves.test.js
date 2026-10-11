import { describe, it, expect, beforeEach } from 'vitest';
import { newGame, S } from '../../src/core/state.js';
import { genWave, hpMul, maxW } from '../../src/core/waves.js';
import { ED } from '../../src/data/enemies.js';
import { MISSIONS } from '../../src/data/campaign.js';

describe('endless waves', () => {
  beforeEach(() => newGame(0, 'endless'));

  it('every wave up to 60 has known enemies', () => {
    for (let w = 1; w <= 60; w++) {
      const q = genWave(w);
      expect(q.length).toBeGreaterThan(0);
      for (const o of q) expect(ED).toHaveProperty(o.t);
    }
  });
  it('is deterministic', () => {
    expect(genWave(17)).toEqual(genWave(17));
  });
  it('brings a boss every 10th wave', () => {
    for (const w of [10, 20, 30]) expect(genWave(w).some((o) => ED[o.t].boss)).toBe(true);
    expect(genWave(9).some((o) => ED[o.t].boss)).toBe(false);
  });
  it('enemy health grows with every wave', () => {
    for (let w = 2; w <= 50; w++) expect(hpMul(w)).toBeGreaterThan(hpMul(w - 1));
  });
  it('has no wave limit', () => {
    expect(maxW()).toBe(Infinity);
  });
});

describe('campaign waves', () => {
  it.each(MISSIONS.filter((M) => M.goal !== 'flow').map((M) => [M.id, M.i]))('mission %s only spawns its roster', (_, i) => {
    newGame(i, 'campaign');
    const M = S.mis;
    expect(maxW()).toBe(M.waves);
    for (let w = 1; w <= M.waves; w++) {
      for (const o of genWave(w)) expect(o.t === M.boss || M.roster[o.t] <= w).toBe(true);
    }
  });
});
