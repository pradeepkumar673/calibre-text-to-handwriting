import { expect, test } from '@playwright/test';

test('home page opens and navigates to the editor', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Welcome to CalligrapheWrite' }),
  ).toBeVisible();

  // The side navigation is visible at Desktop Chrome width (1280 px), so the sidebar link is used.
  await page.getByRole('link', { name: 'Editor', exact: true }).click();

  await expect(page).toHaveURL(/\/editor$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Editor' })).toBeVisible();
});
