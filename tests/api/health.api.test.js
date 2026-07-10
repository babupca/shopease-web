'use strict';
const { request, newApp } = require('../helpers/api');

describe('Platform API', () => {
  test('[API-HLTH-001] GET /health reports UP with version', async () => {
    const res = await request(newApp()).get('/api/health');
    expect(res.body).toMatchObject({ status: 'UP', app: 'ShopEase' });
    expect(res.body.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('[API-HLTH-002] GET /health exposes feature flags for the frontend', async () => {
    expect((await request(newApp()).get('/api/health')).body.features).toHaveProperty('expressCheckout');
  });

  test('[API-HLTH-003] unknown API routes return a JSON 404', async () => {
    const res = await request(newApp()).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('[API-HLTH-004] the storefront home page is served', async () => {
    const res = await request(newApp()).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('ShopEase');
  });
});
