import { describe, it, expect } from 'vitest';
import { COLS, ROWS } from '../../src/core/util.js';
import { MAPS } from '../../src/data/maps.js';
import { MISSIONS } from '../../src/data/campaign.js';
import '../../src/core/map.js';

const all = [...MAPS.map((m) => ['map ' + m.name, m]), ...MISSIONS.map((M) => ['mission ' + M.id, M.map])];

describe('prepared maps', () => {
  it.each(all)('%s has a valid grid, routes and cores', (_, m) => {
    expect(m.ready).toBe(true);
    expect(m.grid).toHaveLength(ROWS);
    for (const row of m.grid) expect(row).toHaveLength(COLS);
    expect(m.routes.length).toBeGreaterThan(0);
    expect(m.cores.length).toBeGreaterThan(0);
    for (const rt of m.routes) {
      expect(rt.path.length).toBeGreaterThan(1);
      expect(rt.len).toBeGreaterThan(0);
      expect(rt.core).toBeLessThan(m.cores.length);
    }
    expect(m.grid.flat().filter((v) => v === 1).length).toBeGreaterThan(5);
    expect(m.grid.flat().some((v) => v === 0)).toBe(true);
  });

  it('every mission got its own map and index', () => {
    MISSIONS.forEach((M, i) => {
      expect(M.i).toBe(i);
      expect(M.map).toBeTruthy();
    });
  });
});
