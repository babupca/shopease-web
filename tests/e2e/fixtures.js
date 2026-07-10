// Shared E2E helpers: log in through the UI or seed state through the API.
const { test: base, expect } = require('@playwright/test');

const ALICE = { email: 'alice@shopease.example', password: 'Passw0rd!' };

async function uiLogin(page, user = ALICE) {
  await page.goto('/login.html');
  await page.getByTestId('login-email').fill(user.email);
  await page.getByTestId('login-password').fill(user.password);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/$/);
}

async function apiAddToCart(page, productId, qty = 1) {
  const token = await page.evaluate(() => localStorage.getItem('shopease.token'));
  const res = await page.request.post('/api/cart/items', { headers: { Authorization: `Bearer ${token}` }, data: { productId, qty } });
  expect(res.ok()).toBeTruthy();
}

const test = base.extend({
  page: async ({ page }, use) => {
    await page.request.post('/api/__test__/reset');
    await use(page);
  },
  loggedIn: async ({ page }, use) => {
    await uiLogin(page);
    await use(page);
  }
});

module.exports = { test, expect, uiLogin, apiAddToCart, ALICE };
