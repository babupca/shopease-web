'use strict';
const auth = require('../../src/services/authService');
const { config } = require('../../src/config');

const ALICE = ['alice@shopease.example', 'Passw0rd!'];

describe('Authentication', () => {
  test('[UT-AUTH-001] valid credentials return a session token and public user', () => {
    const res = auth.login(...ALICE);
    expect(res.token).toMatch(/^sess_/);
    expect(res.user).toMatchObject({ id: 'U-1', role: 'customer' });
  });

  test('[UT-AUTH-002] email matching is case-insensitive', () => {
    expect(auth.login('ALICE@ShopEase.example', 'Passw0rd!').user.id).toBe('U-1');
  });

  test('[UT-AUTH-003] wrong password is rejected with 401', () => {
    expect(() => auth.login('alice@shopease.example', 'nope')).toThrow(expect.objectContaining({ status: 401 }));
  });

  test('[UT-AUTH-004] unknown user is rejected with 401', () => {
    expect(() => auth.login('nobody@shopease.example', 'x')).toThrow(expect.objectContaining({ code: 'INVALID_CREDENTIALS' }));
  });

  test('[UT-AUTH-005] missing credentials are rejected with 400', () => {
    expect(() => auth.login('', '')).toThrow(expect.objectContaining({ status: 400 }));
  });

  test('[UT-AUTH-006] account locks after the maximum failed attempts', () => {
    for (let i = 0; i < config.auth.maxLoginAttempts; i += 1) {
      expect(() => auth.login('bob@shopease.example', 'bad')).toThrow();
    }
    expect(() => auth.login('bob@shopease.example', 'Passw0rd!')).toThrow(expect.objectContaining({ code: 'ACCOUNT_LOCKED' }));
  });

  test('[UT-AUTH-007] successful login resets the failed attempt counter', () => {
    expect(() => auth.login('bob@shopease.example', 'bad')).toThrow();
    auth.login('bob@shopease.example', 'Passw0rd!');
    for (let i = 0; i < config.auth.maxLoginAttempts - 1; i += 1) {
      expect(() => auth.login('bob@shopease.example', 'bad')).toThrow(expect.objectContaining({ code: 'INVALID_CREDENTIALS' }));
    }
  });

  test('[UT-AUTH-008] verify returns the user for a valid token', () => {
    const { token } = auth.login(...ALICE);
    expect(auth.verify(token).email).toBe('alice@shopease.example');
  });

  test('[UT-AUTH-009] verify rejects an unknown token', () => {
    expect(() => auth.verify('sess_bogus')).toThrow(expect.objectContaining({ code: 'UNAUTHORIZED' }));
  });

  test('[UT-AUTH-010] session expires after the configured TTL', () => {
    const now = Date.now();
    const { token } = auth.login(...ALICE, now);
    const afterTtl = now + config.auth.tokenTtlMinutes * 60 * 1000 + 1;
    expect(() => auth.verify(token, afterTtl)).toThrow(expect.objectContaining({ code: 'SESSION_EXPIRED' }));
  });

  test('[UT-AUTH-011] session is still valid just before the TTL', () => {
    const now = Date.now();
    const { token } = auth.login(...ALICE, now);
    expect(auth.verify(token, now + config.auth.tokenTtlMinutes * 60 * 1000 - 1000).id).toBe('U-1');
  });

  test('[UT-AUTH-012] logout invalidates the token', () => {
    const { token } = auth.login(...ALICE);
    auth.logout(token);
    expect(() => auth.verify(token)).toThrow();
  });

  test('[UT-AUTH-013] register creates a customer account', () => {
    expect(auth.register({ email: 'new@shopease.example', password: 'LongEnough1' })).toMatchObject({ role: 'customer' });
  });

  test('[UT-AUTH-014] register rejects a duplicate email', () => {
    expect(() => auth.register({ email: 'alice@shopease.example', password: 'LongEnough1' })).toThrow(
      expect.objectContaining({ code: 'EMAIL_EXISTS' })
    );
  });

  test('[UT-AUTH-015] register rejects a short password', () => {
    expect(() => auth.register({ email: 'x@shopease.example', password: 'short' })).toThrow(expect.objectContaining({ code: 'WEAK_PASSWORD' }));
  });

  test('[UT-AUTH-016] register rejects an invalid email', () => {
    expect(() => auth.register({ email: 'not-an-email', password: 'LongEnough1' })).toThrow(expect.objectContaining({ status: 400 }));
  });

  test('[UT-AUTH-017] public user never exposes the password', () => {
    expect(auth.login(...ALICE).user).not.toHaveProperty('password');
  });
});
