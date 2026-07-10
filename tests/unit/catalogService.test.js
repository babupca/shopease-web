'use strict';
const catalog = require('../../src/services/catalogService');

describe('Catalog listing', () => {
  test('[UT-CAT-001] returns the first page of 10 active products by default', () => {
    const res = catalog.listProducts();
    expect(res.items).toHaveLength(10);
    expect(res.total).toBe(11);
  });

  test('[UT-CAT-002] excludes inactive (discontinued) products', () => {
    const ids = catalog.listProducts({ pageSize: 50 }).items.map((p) => p.id);
    expect(ids).not.toContain('P-1012');
  });

  test('[UT-CAT-003] filters by category', () => {
    const res = catalog.listProducts({ category: 'Footwear' });
    expect(res.items.map((p) => p.id)).toEqual(['P-1001', 'P-1002']);
  });

  test('[UT-CAT-004] searches product names case-insensitively', () => {
    expect(catalog.listProducts({ search: 'BOOTS' }).items[0].id).toBe('P-1002');
  });

  test('[UT-CAT-005] searches product descriptions', () => {
    expect(catalog.listProducts({ search: 'merino' }).items[0].id).toBe('P-1003');
  });

  test('[UT-CAT-006] returns an empty page when nothing matches', () => {
    expect(catalog.listProducts({ search: 'kayak' })).toMatchObject({ items: [], total: 0 });
  });

  test.each([
    { id: 'UT-CAT-007', sort: 'price_asc', first: 'P-1009' },
    { id: 'UT-CAT-008', sort: 'price_desc', first: 'P-1010' },
    { id: 'UT-CAT-009', sort: 'name', first: 'P-1009' }
  ])('[$id] sorts by $sort', ({ sort, first }) => {
    expect(catalog.listProducts({ sort, pageSize: 50 }).items[0].id).toBe(first);
  });

  test('[UT-CAT-010] rejects an unsupported sort option', () => {
    expect(() => catalog.listProducts({ sort: 'rating' })).toThrow(expect.objectContaining({ code: 'INVALID_SORT' }));
  });

  test('[UT-CAT-011] paginates results', () => {
    const res = catalog.listProducts({ page: 2, pageSize: 5 });
    expect(res.items).toHaveLength(5);
    expect(res.page).toBe(2);
  });

  test('[UT-CAT-012] caps the page size at 50', () => {
    expect(catalog.listProducts({ pageSize: 500 }).pageSize).toBe(catalog.MAX_PAGE_SIZE);
  });

  test('[UT-CAT-013] filters by price range', () => {
    const prices = catalog.listProducts({ minPrice: 20, maxPrice: 40, pageSize: 50 }).items.map((p) => p.price);
    expect(prices.every((p) => p >= 20 && p <= 40)).toBe(true);
    expect(prices).toHaveLength(3);
  });

  test('[UT-CAT-014] returns product detail by id', () => {
    expect(catalog.getProduct('P-1004').name).toBe('Insulated Water Bottle');
  });

  test('[UT-CAT-015] returns 404 for an unknown product', () => {
    expect(() => catalog.getProduct('P-9999')).toThrow(expect.objectContaining({ status: 404 }));
  });

  test('[UT-CAT-016] returns 404 for an inactive product', () => {
    expect(() => catalog.getProduct('P-1012')).toThrow(expect.objectContaining({ code: 'PRODUCT_NOT_FOUND' }));
  });

  test('[UT-CAT-017] lists categories alphabetically', () => {
    expect(catalog.listCategories()).toEqual(['Accessories', 'Apparel', 'Footwear', 'Gear']);
  });
});
