const { test, expect, apiAddToCart } = require('./fixtures');

test.describe('Cart management', () => {
  test('[E2E-CART-001] added items appear in the cart with subtotal', async ({ loggedIn: page }) => {
    await apiAddToCart(page, 'P-1003', 2);
    await page.goto('/cart.html');
    await expect(page.getByTestId('cart-row')).toHaveCount(1);
    await expect(page.getByTestId('cart-subtotal')).toHaveText('$29.98');
  });

  test('[E2E-CART-002] changing quantity updates the line total', async ({ loggedIn: page }) => {
    await apiAddToCart(page, 'P-1003', 1);
    await page.goto('/cart.html');
    await page.getByTestId('cart-qty').fill('3');
    await page.getByTestId('cart-qty').dispatchEvent('change');
    await expect(page.getByTestId('line-total')).toHaveText('$44.97');
  });

  test('[E2E-CART-003] removing an item empties the cart', async ({ loggedIn: page }) => {
    await apiAddToCart(page, 'P-1003', 1);
    await page.goto('/cart.html');
    await page.getByTestId('remove-item').click();
    await expect(page.getByTestId('cart-empty')).toBeVisible();
  });

  test('[E2E-CART-004] quantity above the maximum shows a validation message', async ({ loggedIn: page }) => {
    await apiAddToCart(page, 'P-1003', 1);
    await page.goto('/cart.html');
    await page.getByTestId('cart-qty').fill('11');
    await page.getByTestId('cart-qty').dispatchEvent('change');
    await expect(page.getByTestId('cart-message')).toContainText('between 1 and 10');
  });

  test('[E2E-CART-005] cart page requires login', async ({ page }) => {
    await page.goto('/cart.html');
    await expect(page).toHaveURL(/login\.html/);
  });
});
