import { describe, it, expect } from 'vitest';
import { newGame } from '../../src/core/state.ts';
import { waveMods, cloakFrom, WEEKLY_CLOAK_FROM } from '../../src/core/waves.ts';

const cfg = (weekly, key) => ({ key: key || (weekly ? '2026-W43' : '2026-10-16'), mi: 0, mods: ['cloak', 'fast'], ban: null, gold: 300, waves: weekly ? 40 : 20, weekly });

describe('challenge modifiers', () => {
  it('start on wave 3', () => {
    newGame(0, 'daily', cfg(false));
    expect(waveMods(2)).toEqual([]);
    expect(waveMods(3)).toEqual(['cloak', 'fast']);
  });

  it('weekly invisible enemies wait until wave 5', () => {
    newGame(0, 'weekly', cfg(true));
    expect(WEEKLY_CLOAK_FROM).toBe(5);
    expect(waveMods(3)).toEqual(['fast']);
    expect(waveMods(4)).toEqual(['fast']);
    expect(waveMods(5)).toEqual(['cloak', 'fast']);
  });

  it('the week in progress keeps the old rule', () => {
    expect(cloakFrom(cfg(true, '2026-W42'))).toBe(3);
    expect(cloakFrom(cfg(true, '2026-W43'))).toBe(5);
    expect(cloakFrom(cfg(true, '2027-W01'))).toBe(5);
    newGame(0, 'weekly', cfg(true, '2026-W42'));
    expect(waveMods(3)).toEqual(['cloak', 'fast']);
  });
});
