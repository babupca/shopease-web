'use strict';
const payments = require('../../src/services/payments/paymentService');
const gateway = require('../../src/services/payments/paymentGatewayClient');

const order = (cardToken, orderId = 'ORD-P1') => ({ orderId, amount: 42.5, currency: 'USD', cardToken });

describe('Payment authorization', () => {
  test('[UT-PAY-001] authorizes on the first attempt', async () => {
    await expect(payments.authorizePayment(order('tok_success'))).resolves.toMatchObject({ status: 'AUTHORIZED', attempts: 1 });
  });

  test('[UT-PAY-002] recovers from a single gateway timeout', async () => {
    const res = await payments.authorizePayment(order('tok_timeout_once'));
    expect(res.attempts).toBe(2);
  });

  test('[UT-PAY-003] maps a persistent timeout to PAYMENT_TIMEOUT (504)', async () => {
    await expect(payments.authorizePayment(order('tok_timeout'))).rejects.toMatchObject({ status: 504, code: 'PAYMENT_TIMEOUT' });
    expect(gateway.callCount('ORD-P1')).toBe(3);
  });

  test('[UT-PAY-004] maps a decline to PAYMENT_DECLINED (402) without retrying', async () => {
    await expect(payments.authorizePayment(order('tok_decline'))).rejects.toMatchObject({ status: 402, code: 'PAYMENT_DECLINED' });
    expect(gateway.callCount('ORD-P1')).toBe(1);
  });

  test('[UT-PAY-005] refunds a payment', async () => {
    await expect(payments.refundPayment({ authorizationId: 'AUTH-9', amount: 5 })).resolves.toMatchObject({ status: 'REFUNDED' });
  });
});
