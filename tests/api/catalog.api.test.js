'use strict';
const { request, newApp } = require('../helpers/api');

describe('Catalog API', () => {
  let app;
  beforeEach(() => { app = newApp(); });

  test('[API-CAT-001] GET /products returns a paged list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 1, pageSize: 10, total: 11 });
  });

  test('[API-CAT-002] GET /products filters by category', async () => {
    const res = await request(app).get('/api/products?category=Gear');
    expect(res.body.items.every((p) => p.category === 'Gear')).toBe(true);
  });

  test('[API-CAT-003] GET /products searches by text', async () => {
    const res = await request(app).get('/api/products?search=tent');
    expect(res.body.items.map((p) => p.id)).toEqual(['P-1010']);
  });

  test('[API-CAT-004] GET /products sorts by price ascending', async () => {
    const prices = (await request(app).get('/api/products?sort=price_asc&pageSize=50')).body.items.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('[API-CAT-005] an unsupported sort returns 400', async () => {
    expect((await request(app).get('/api/products?sort=popularity')).status).toBe(400);
  });

  test('[API-CAT-006] GET /products/:id returns detail with inStock=true', async () => {
    const res = await request(app).get('/api/products/P-1001');
    expect(res.body).toMatchObject({ id: 'P-1001', inStock: true });
  });

  test('[API-CAT-007] an out-of-stock product reports inStock=false', async () => {
    expect((await request(app).get('/api/products/P-1011')).body.inStock).toBe(false);
  });

  test('[API-CAT-008] an unknown product returns 404 with an error code', async () => {
    const res = await request(app).get('/api/products/P-0000');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  test('[API-CAT-009] GET /categories lists categories', async () => {
    expect((await request(app).get('/api/categories')).body).toContain('Footwear');
  });

  test('[API-CAT-010] pageSize above 50 is capped', async () => {
    expect((await request(app).get('/api/products?pageSize=1000')).body.pageSize).toBe(50);
  });
});
