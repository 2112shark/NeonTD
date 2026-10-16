import { describe, it, expect } from 'vitest';
import { speed } from '../../src/core/state.ts';
import { PROG } from '../../src/meta/progress.ts';
import { SPEEDS, cycleSpeed, initSpeed } from '../../src/ui/hud.ts';

describe('speed button', () => {
  it('cycles through the speeds, wraps around and remembers the choice', () => {
    initSpeed();
    const btn = document.querySelector('#speed');
    const seen = [];
    for (let i = 0; i < SPEEDS.length; i++) { cycleSpeed(); seen.push(speed); }
    expect([...seen].sort((a, b) => a - b)).toEqual(SPEEDS);
    expect(btn.textContent).toBe('×' + speed);
    expect(PROG.set.speed).toBe(speed);
    expect(JSON.parse(localStorage.getItem('neon-rubezh-v2')).set.speed).toBe(speed);
  });
});
