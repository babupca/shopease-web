'use strict';
const { loadConfig, deepMerge } = require('../../src/config');

describe('Configuration', () => {
  test('[UT-CFG-001] local config uses default values', () => {
    const c = loadConfig('local');
    expect(c.payment.retry.maxRetries).toBeGreaterThanOrEqual(1);
    expect(c.cart.maxQtyPerItem).toBe(10);
  });

  test('[UT-CFG-002] SIT overrides the gateway URL and timeout', () => {
    const c = loadConfig('sit');
    expect(c.payment.gatewayUrl).toContain('sit.');
    expect(c.payment.timeoutMs).toBeGreaterThan(0);
  });

  test('[UT-CFG-003] UAT overrides the gateway URL', () => {
    expect(loadConfig('uat').payment.gatewayUrl).toContain('uat.');
  });

  test('[UT-CFG-004] ST disables outbound notifications', () => {
    expect(loadConfig('st').notifications.enabled).toBe(false);
  });

  test('[UT-CFG-005] environment files keep keys they do not override', () => {
    expect(loadConfig('sit').payment.retry).toEqual(loadConfig('local').payment.retry);
  });

  test('[UT-CFG-006] deepMerge merges nested objects', () => {
    expect(deepMerge({ a: { b: 1, c: 2 } }, { a: { c: 3 } })).toEqual({ a: { b: 1, c: 3 } });
  });

  test('[UT-CFG-007] feature flags are booleans', () => {
    const flags = loadConfig('local').featureFlags;
    expect(Object.values(flags).every((v) => typeof v === 'boolean')).toBe(true);
  });
});
