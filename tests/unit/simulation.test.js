import { describe, it, expect } from 'vitest';
import { COLS, ROWS } from '../../src/core/util.ts';
import { newGame, S } from '../../src/core/state.ts';
import { build, canBuild } from '../../src/core/actions.ts';
import { startWave, update } from '../../src/core/combat.ts';

const run = (sec) => { for (let i = 0; i < sec * 60 && !S.over; i++) update(1 / 60); };

// Tiles next to the path, where towers actually reach enemies
function pathSideTiles() {
  const out = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!canBuild(c, r)) continue;
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => S.grid[r + dy] && S.grid[r + dy][c + dx] === 1);
    if (near) out.push([c, r]);
  }
  return out;
}

describe('battle simulation', () => {
  it('a defended first wave is cleared without losses', () => {
    newGame(0, 'endless');
    S.gold = 2000;
    for (const [c, r] of pathSideTiles().slice(0, 6)) build('laser', c, r);
    startWave();
    expect(S.wave).toBe(1);
    expect(S.waveActive).toBe(true);
    run(60);
    expect(S.waveActive).toBe(false);
    expect(S.enemies).toHaveLength(0);
    expect(S.kills).toBeGreaterThan(0);
    expect(S.lives).toBe(S.maxLives);
  });

  it('an undefended core loses lives and the run ends', () => {
    newGame(2, 'endless');
    for (let i = 0; i < 40 && !S.over; i++) {
      if (!S.waveActive) startWave();
      run(20);
    }
    expect(S.lives).toBeLessThan(S.maxLives);
    expect(S.over).toBeTruthy();
  });
});
