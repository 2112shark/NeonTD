import { describe, it, expect } from 'vitest';
import { mergeProg } from '../../src/meta/net.js';
import { freshProg } from '../../src/meta/progress.js';

describe('mergeProg (local save + cloud save)', () => {
  const local = () => Object.assign(freshProg(), {
    ts: 200, waves: 40, kills: 900, ms: { m1: 0b011, m2: 0b001 }, ach: { first: 1 }, specs: ['laserA'],
    best: { endless0: 25 }, st: { spec: { laserA: 2 }, boss: 3 }, lab: { cap: 2 }, daily: { key: '2026-10-11', best: 5000, won: false },
  });
  const cloud = () => Object.assign(freshProg(), {
    ts: 100, waves: 55, kills: 700, ms: { m1: 0b100, m3: 0b111 }, ach: { boss: 1 }, specs: ['laserA', 'cryoB'],
    best: { endless0: 31, endless1: 12 }, st: { spec: { laserA: 1, cryoB: 4 }, boss: 7 }, lab: { cap: 1, dmg: 3 },
    daily: { key: '2026-10-11', best: 7000, won: true },
  });

  it('keeps the best of both for counters, stars and records', () => {
    const o = mergeProg(local(), cloud());
    expect(o.waves).toBe(55);
    expect(o.kills).toBe(900);
    expect(o.ms).toEqual({ m1: 0b111, m2: 0b001, m3: 0b111 });
    expect(o.stars).toEqual({ m1: 3, m2: 1, m3: 3 });
    expect(o.ach).toEqual({ first: 1, boss: 1 });
    expect(o.specs.sort()).toEqual(['cryoB', 'laserA']);
    expect(o.best).toEqual({ endless0: 31, endless1: 12 });
    expect(o.st).toEqual({ spec: { laserA: 2, cryoB: 4 }, boss: 7 });
    expect(o.daily).toEqual({ key: '2026-10-11', best: 7000, won: true });
    expect(o.ts).toBe(200);
  });

  it('takes choices such as lab spending from the newer save', () => {
    expect(mergeProg(local(), cloud()).lab).toEqual({ cap: 2 });
    expect(mergeProg(Object.assign(local(), { ts: 50 }), cloud()).lab).toEqual({ cap: 1, dmg: 3 });
  });

  it('ignores an empty cloud save', () => {
    const L = local();
    expect(mergeProg(L, null)).toBe(L);
  });
});
