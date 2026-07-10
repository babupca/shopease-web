const { test, expect, apiAddToCart } = require('./fixtures');

test.describe('Order management', () => {
  test.beforeEach(async ({ loggedIn: page }) => {
    await apiAddToCart(page, 'P-1004', 1);
    await page.goto('/checkout.html');
    await page.getByTestId('place-order').click();
    await expect(page.getByTestId('checkout-result')).toContainText('confirmed');
    await page.goto('/orders.html');
  });

  test('[E2E-ORD-001] the new order is listed as PAID with its total', async ({ page }) => {
    await expect(page.getByTestId('order-status').first()).toHaveText('PAID');
    await expect(page.getByTestId('order-total').first()).toHaveText('$31.73');
  });

  test('[E2E-ORD-002] customer can cancel a PAID order', async ({ page }) => {
    await page.getByTestId('cancel-order').first().click();
    await expect(page.getByTestId('order-status').first()).toHaveText('CANCELLED');
  });
});
