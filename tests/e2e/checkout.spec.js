// @critical-journey @financial
const { test, expect, apiAddToCart } = require('./fixtures');

test.describe('Checkout & payment @critical-journey', () => {
  test.beforeEach(async ({ loggedIn: page }) => {
    await apiAddToCart(page, 'P-1001', 1);
    await page.goto('/checkout.html');
  });

  test('[E2E-CHK-001] quote shows subtotal, shipping, tax and total', async ({ page }) => {
    await page.getByTestId('checkout-quote').click();
    await expect(page.getByTestId('quote-total')).toHaveText('$96.51');
  });

  test('[E2E-CHK-002] placing an order with a valid card confirms the order', async ({ page }) => {
    await page.getByTestId('place-order').click();
    await expect(page.getByTestId('checkout-result')).toContainText('confirmed');
  });

  test('[E2E-CHK-003] a declined card shows a payment error', async ({ page }) => {
    await page.getByTestId('checkout-card').selectOption('tok_decline');
    await page.getByTestId('place-order').click();
    await expect(page.getByTestId('checkout-result')).toContainText('Payment declined');
  });

  test('[E2E-CHK-004] a slow gateway still completes the order (retry)', async ({ page }) => {
    await page.getByTestId('checkout-card').selectOption('tok_timeout_once');
    await page.getByTestId('place-order').click();
    await expect(page.getByTestId('checkout-result')).toContainText('confirmed');
  });

  test('[E2E-CHK-005] a gateway outage shows a retry message', async ({ page }) => {
    await page.getByTestId('checkout-card').selectOption('tok_timeout');
    await page.getByTestId('place-order').click();
    await expect(page.getByTestId('checkout-result')).toContainText('try again');
  });

  test('[E2E-CHK-006] promo code WELCOME10 reduces the quoted total', async ({ page }) => {
    await page.getByTestId('checkout-promo').fill('WELCOME10');
    await page.getByTestId('checkout-quote').click();
    await expect(page.getByTestId('quote-discount')).toHaveText('-$9.00');
  });

  test('[E2E-CHK-007] Oregon region quotes zero tax', async ({ page }) => {
    await page.getByTestId('checkout-region').selectOption('US-OR');
    await page.getByTestId('checkout-quote').click();
    await expect(page.getByTestId('quote-tax')).toHaveText('$0.00');
  });

  test('[E2E-CHK-008] express checkout button is hidden while the flag is off', async ({ page }) => {
    await expect(page.getByTestId('express-checkout')).toBeHidden();
  });
});
