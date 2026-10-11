import { test, expect } from '@playwright/test';

// The page talks to the game through window.__td, the debug handle the game exposes.
test.beforeEach(async ({ page }) => {
  // Fonts come from Google; keep tests offline and deterministic
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.clock.install({ time: new Date('2026-10-11T10:00:00') });
});

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return errors;
}

test('lobby opens and every tab renders', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page).toHaveTitle('Неоновый рубеж');
  await expect(page.locator('#lbView .cta')).toHaveText('Начать игру');
  for (const [tab, heading] of [['camp', 'Кампания'], ['lab', 'Лаборатория'], ['awards', 'Награды'], ['more', 'Ещё']]) {
    await page.click(`#lbNav [data-go="${tab}"]`);
    await expect(page.locator('#lbView h2').first()).toContainText(heading);
  }
  expect(errors).toEqual([]);
});

test('first mission starts and a wave can be fought', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.click('#lbView .cta');
  await expect(page.locator('#lobby')).toBeHidden();
  await expect(page.locator('#cv')).toBeVisible();

  const built = await page.evaluate(() => {
    const T = window.__td, S = T.S;
    S.tut = null;
    S.gold = 1000;
    let n = 0;
    for (let r = 0; r < 15; r++) for (let c = 0; c < 12; c++) {
      const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => S.grid[r + dy] && S.grid[r + dy][c + dx] === 1);
      if (n < 5 && near && T.build('laser', c, r)) n++;
    }
    return n;
  });
  expect(built).toBe(5);

  await page.click('#bNext');
  await page.clock.runFor(40_000);
  const s = await page.evaluate(() => { const S = window.__td.S; return { wave: S.wave, kills: S.kills, lives: S.lives, max: S.maxLives }; });
  expect(s.wave).toBeGreaterThanOrEqual(1);
  expect(s.kills).toBeGreaterThan(0);
  expect(s.lives).toBe(s.max);
  expect(errors).toEqual([]);
});

test('pause menu opens and returns to the lobby', async ({ page }) => {
  await page.goto('/');
  await page.click('#lbView .cta');
  await page.click('#bMenu');
  await expect(page.locator('#sheet')).toBeVisible();
  await page.click('#shExit');
  await expect(page.locator('#lobby')).toBeVisible();
});
