// @smoke @critical-journey
const { test, expect, uiLogin, apiAddToCart } = require('./fixtures');

test.describe('Release smoke @smoke', () => {
  test('[E2E-SMOKE-001] storefront loads with products', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('product-card').first()).toBeVisible();
  });

  test('[E2E-SMOKE-002] customer can log in', async ({ page }) => {
    await uiLogin(page);
    await expect(page.getByTestId('nav-auth')).toHaveText('Log out');
  });

  test('[E2E-SMOKE-003] checkout end-to-end smoke: add to cart and place order', async ({ page }) => {
    await uiLogin(page);
    await page.getByTestId('add-to-cart').first().click();
    await expect(page.getByTestId('catalog-message')).toHaveText('Added to cart');
    await page.goto('/checkout.html');
    await page.getByTestId('place-order').click();
    await expect(page.getByTestId('checkout-result')).toContainText('confirmed');
  });

  test('[E2E-SMOKE-004] order history page loads after purchase', async ({ page }) => {
    await uiLogin(page);
    await apiAddToCart(page, 'P-1004');
    await page.goto('/checkout.html');
    await page.getByTestId('place-order').click();
    await page.goto('/orders.html');
    await expect(page.getByTestId('order-row').first()).toBeVisible();
  });

  test('[E2E-SMOKE-005] health endpoint is UP', async ({ request }) => {
    expect((await (await request.get('/api/health')).json()).status).toBe('UP');
  });
});
