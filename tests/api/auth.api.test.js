'use strict';
const { request, newApp, loginAs, USERS } = require('../helpers/api');

describe('Auth API', () => {
  let app;
  beforeEach(() => { app = newApp(); });

  test('[API-AUTH-001] POST /auth/login returns 200 with a token', async () => {
    const res = await request(app).post('/api/auth/login').send(USERS.alice);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('[API-AUTH-002] POST /auth/login with a wrong password returns 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: USERS.alice.email, password: 'x' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('[API-AUTH-003] POST /auth/login without a body returns 400', async () => {
    expect((await request(app).post('/api/auth/login').send({})).status).toBe(400);
  });

  test('[API-AUTH-004] GET /auth/me returns the current user', async () => {
    const token = await loginAs(app);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.body.email).toBe(USERS.alice.email);
  });

  test('[API-AUTH-005] GET /auth/me without a token returns 401', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
  });

  test('[API-AUTH-006] logout invalidates the session', async () => {
    const token = await loginAs(app);
    expect((await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`)).status).toBe(204);
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)).status).toBe(401);
  });

  test('[API-AUTH-007] POST /auth/register returns 201', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'new@shopease.example', password: 'LongEnough1' });
    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('password');
  });

  test('[API-AUTH-008] registering an existing email returns 409', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: USERS.bob.email, password: 'LongEnough1' });
    expect(res.status).toBe(409);
  });

  test('[API-AUTH-009] repeated failures lock the account (423)', async () => {
    for (let i = 0; i < 5; i += 1) await request(app).post('/api/auth/login').send({ email: USERS.bob.email, password: 'bad' });
    expect((await request(app).post('/api/auth/login').send(USERS.bob)).status).toBe(423);
  });

  test('[API-AUTH-010] a malformed Authorization header is rejected', async () => {
    expect((await request(app).get('/api/auth/me').set('Authorization', 'Token abc')).status).toBe(401);
  });
});
