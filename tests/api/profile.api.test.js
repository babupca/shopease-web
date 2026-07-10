'use strict';
const { request, newApp, loginAs } = require('../helpers/api');

describe('Profile API', () => {
  let app;
  let headers;
  beforeEach(async () => {
    app = newApp();
    headers = { Authorization: `Bearer ${await loginAs(app)}` };
  });

  test('[API-PROF-001] GET /profile returns my profile without the password', async () => {
    const res = await request(app).get('/api/profile').set(headers);
    expect(res.body.email).toBe('alice@shopease.example');
    expect(res.body).not.toHaveProperty('password');
  });

  test('[API-PROF-002] PUT /profile updates the name', async () => {
    expect((await request(app).put('/api/profile').set(headers).send({ name: 'Alice B' })).body.name).toBe('Alice B');
  });

  test('[API-PROF-003] PUT /profile rejects an unsupported region', async () => {
    expect((await request(app).put('/api/profile').set(headers).send({ region: 'XX' })).status).toBe(400);
  });

  test('[API-PROF-004] POST /profile/addresses adds an address', async () => {
    const res = await request(app).post('/api/profile/addresses').set(headers).send({ line1: '2 Elm', city: 'Austin', postcode: '73301' });
    expect(res.status).toBe(201);
  });

  test('[API-PROF-005] an incomplete address returns 400', async () => {
    expect((await request(app).post('/api/profile/addresses').set(headers).send({ line1: '2 Elm' })).status).toBe(400);
  });

  test('[API-PROF-006] profile requires authentication', async () => {
    expect((await request(app).get('/api/profile')).status).toBe(401);
  });
});
