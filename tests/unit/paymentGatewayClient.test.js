'use strict';
const gateway = require('../../src/services/payments/paymentGatewayClient');

const base = { amount: 50, currency: 'USD', idempotencyKey: 'ORD-T1' };

describe('PayGate gateway client', () => {
  test('[UT-PAYGW-001] authorizes a valid card', async () => {
    await expect(gateway.authorize({ ...base, cardToken: 'tok_success' })).resolves.toMatchObject({ status: 'AUTHORIZED', amount: 50 });
  });

  test.each([
    { id: 'UT-PAYGW-002', token: 'tok_decline', code: 'CARD_DECLINED' },
    { id: 'UT-PAYGW-003', token: 'tok_insufficient', code: 'CARD_DECLINED' },
    { id: 'UT-PAYGW-004', token: 'tok_timeout', code: 'GATEWAY_TIMEOUT' }
  ])('[$id] $token fails with $code', async ({ token, code }) => {
    await expect(gateway.authorize({ ...base, cardToken: token })).rejects.toMatchObject({ code });
  });

  test('[UT-PAYGW-005] tok_timeout_once times out first, then authorizes', async () => {
    await expect(gateway.authorize({ ...base, cardToken: 'tok_timeout_once' })).rejects.toMatchObject({ code: 'GATEWAY_TIMEOUT' });
    await expect(gateway.authorize({ ...base, cardToken: 'tok_timeout_once' })).resolves.toMatchObject({ status: 'AUTHORIZED' });
  });

  test('[UT-PAYGW-006] requires a card token', async () => {
    await expect(gateway.authorize({ ...base, cardToken: undefined })).rejects.toMatchObject({ code: 'CARD_TOKEN_REQUIRED' });
  });

  test('[UT-PAYGW-007] rejects a non-positive amount', async () => {
    await expect(gateway.authorize({ ...base, amount: 0, cardToken: 'tok_success' })).rejects.toMatchObject({ code: 'INVALID_AMOUNT' });
  });

  test('[UT-PAYGW-008] counts calls per idempotency key', async () => {
    await gateway.authorize({ ...base, cardToken: 'tok_success' });
    await gateway.authorize({ ...base, cardToken: 'tok_success' });
    expect(gateway.callCount('ORD-T1')).toBe(2);
  });

  test('[UT-PAYGW-009] refunds an authorization', async () => {
    await expect(gateway.refund({ authorizationId: 'AUTH-1', amount: 10 })).resolves.toMatchObject({ status: 'REFUNDED' });
  });

  test('[UT-PAYGW-010] refund requires an authorization id', async () => {
    await expect(gateway.refund({ amount: 10 })).rejects.toMatchObject({ status: 400 });
  });
});
