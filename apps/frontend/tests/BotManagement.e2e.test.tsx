import { expect, test } from '@playwright/test';

test.describe('Bot Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/src/);
    await expect(page.getByText('Bot Management')).toBeVisible();
  });

  test('displays a list of bots', async ({ page }) => {
    const botList = page.locator('.bot-list');
    await expect(botList).toBeVisible();

    const botCards = page.locator('.bot-card');
    await expect(botCards.first()).toBeVisible();
  });

  test('can expand a bot to see workers', async ({ page }) => {
    const firstBot = page.locator('.bot-card').first();
    const header = firstBot.locator('.card-header');

    await expect(firstBot).not.toHaveClass(/expanded/);

    await header.click();
    await expect(firstBot).toHaveClass(/expanded/);

    const content = firstBot.locator('.card-content');
    await expect(content).toBeVisible();
  });

  test('can load more bots (pagination)', async ({ page }) => {
    const botList = page.locator('.bot-list');
    await expect(botList).toBeVisible();

    const loadMoreBtn = page.getByRole('button', { name: /Load More/i });
    if (await loadMoreBtn.isVisible()) {
      await loadMoreBtn.click();
    }
  });
});
