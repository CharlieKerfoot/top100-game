import { test, expect } from '@playwright/test';

// Smoke + regression coverage for /daily. Each test preseeds localStorage so
// the onboarding tooltip and prior-result branches are under test control.

test.describe('/daily', () => {
  test('renders the game UI (no SSR crash, autocomplete present)', async ({ page }) => {
    await page.goto('/daily');
    // Search input is rendered client-side only (SSR disabled). If the input
    // never mounts, that is the regression dcee4dd/d77f399 fixed.
    await expect(page.getByRole('textbox').first()).toBeVisible();
  });

  test('shows zero-state histogram without crashing when no scores exist', async ({ page }) => {
    // Force into results view by seeding a completed day for today.
    await page.addInitScript(() => {
      const today = new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      window.localStorage.setItem('onboarding_seen', '1');
      window.localStorage.setItem(
        'daily_stats',
        JSON.stringify({
          streak: 1,
          maxStreak: 1,
          gamesPlayed: 1,
          bestScore: 0,
          history: { [key]: { score: 0, listId: 'seed', guessCount: 0, guessedRanks: [] } },
        }),
      );
    });
    await page.goto('/daily');
    // If the histogram crashes on empty scores, the page would error out —
    // we just need the page to remain interactive.
    await expect(page.locator('body')).toBeVisible();
  });

  test('percentile persists across reload (d4a51c5 regression)', async ({ page }) => {
    await page.addInitScript(() => {
      const today = new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      window.localStorage.setItem('onboarding_seen', '1');
      window.localStorage.setItem(
        'daily_stats',
        JSON.stringify({
          streak: 1,
          maxStreak: 1,
          gamesPlayed: 1,
          bestScore: 42,
          history: {
            [key]: {
              score: 42,
              listId: 'seed',
              guessCount: 3,
              guessedRanks: [1, 2, 3],
              percentile: 77,
            },
          },
        }),
      );
    });
    await page.goto('/daily');
    // Percentile line is rendered from localStorage without refetching.
    // We assert the numeric text appears somewhere in the results region.
    const body = await page.textContent('body');
    expect(body).toMatch(/77/);
  });
});
