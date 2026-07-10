// @accessibility
const { test, expect } = require('./fixtures');

test.describe('Accessibility checks @accessibility', () => {
  test('[E2E-A11Y-001] catalog filters have accessible labels', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Search products')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
    await expect(page.getByLabel('Sort by')).toBeVisible();
  });

  test('[E2E-A11Y-002] login form fields are labelled and errors use role=alert', async ({ page }) => {
    await page.goto('/login.html');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(1);
  });

  test('[E2E-A11Y-003] every page has a descriptive title and html lang', async ({ page }) => {
    for (const path of ['/', '/login.html']) {
      await page.goto(path);
      await expect(page).toHaveTitle(/\| ShopEase$/);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    }
  });

  test('[E2E-A11Y-004] login can be completed with the keyboard only', async ({ page }) => {
    await page.goto('/login.html');
    await page.getByTestId('login-email').focus();
    await page.keyboard.type('alice@shopease.example');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Passw0rd!');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/$/);
  });

  test('[E2E-A11Y-005] checkout form controls are labelled', async ({ loggedIn: page }) => {
    await page.goto('/checkout.html');
    await expect(page.getByLabel('Tax region')).toBeVisible();
    await expect(page.getByLabel('Promo code')).toBeVisible();
    await expect(page.getByLabel('Card')).toBeVisible();
  });
});
