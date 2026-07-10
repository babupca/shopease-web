const { test, expect } = require('./fixtures');

test.describe('Catalog browsing', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('[E2E-CAT-001] search narrows the product grid', async ({ page }) => {
    await page.getByTestId('search-input').fill('tent');
    await expect(page.getByTestId('product-card')).toHaveCount(1);
  });

  test('[E2E-CAT-002] category filter shows only that category', async ({ page }) => {
    await page.getByTestId('category-filter').selectOption('Footwear');
    await expect(page.getByTestId('product-card')).toHaveCount(2);
  });

  test('[E2E-CAT-003] sorting by price low to high puts the cheapest first', async ({ page }) => {
    await page.getByTestId('sort-select').selectOption('price_asc');
    await expect(page.getByTestId('product-name').first()).toHaveText('Camping Mug');
  });

  test('[E2E-CAT-004] out-of-stock products cannot be added', async ({ page }) => {
    await expect(page.locator('[data-product-id="P-1011"] [data-testid="add-to-cart"]')).toBeDisabled();
  });

  test('[E2E-CAT-005] a search with no results shows a message', async ({ page }) => {
    await page.getByTestId('search-input').fill('kayak');
    await expect(page.getByTestId('catalog-message')).toHaveText('No products match your search.');
  });

  test('[E2E-CAT-006] anonymous add-to-cart redirects to login', async ({ page }) => {
    await page.getByTestId('add-to-cart').first().click();
    await expect(page).toHaveURL(/login\.html/);
  });
});
