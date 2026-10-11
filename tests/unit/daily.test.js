import { describe, it, expect } from 'vitest';
import { dayKey, weekKey, dailyCfg } from '../../src/meta/daily.js';
import { MODS } from '../../src/data/enemies.js';
import { TYPES } from '../../src/data/towers.js';

describe('date keys', () => {
  it('dayKey is YYYY-MM-DD in local time', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dayKey(new Date(2026, 9, 11))).toBe('2026-10-11');
  });
  it('weekKey follows ISO weeks', () => {
    expect(weekKey(new Date(2026, 0, 1))).toBe('2026-W01');
    expect(weekKey(new Date(2024, 11, 30))).toBe('2025-W01');
    expect(weekKey(new Date(2021, 0, 3))).toBe('2020-W53');
    expect(weekKey(new Date(2026, 9, 11))).toBe('2026-W41');
  });
});

describe('daily challenge config', () => {
  it('is deterministic for a given day', () => {
    expect(dailyCfg('2026-10-11')).toEqual(dailyCfg('2026-10-11'));
  });
  it.each(['2026-10-11', '2026-10-12', '2026-01-01', '2025-07-04', '2027-02-28'])('%s is well formed', (key) => {
    const c = dailyCfg(key);
    expect(c.key).toBe(key);
    expect(c.waves).toBe(20);
    expect([0, 1, 2]).toContain(c.mi);
    expect(c.mods).toHaveLength(2);
    expect(new Set(c.mods).size).toBe(2);
    for (const m of c.mods) expect(MODS).toHaveProperty(m);
    if (c.ban) expect(TYPES).toContain(c.ban);
    if (c.mods.includes('cloak')) expect(['cryo', 'tesla']).not.toContain(c.ban);
  });
});
