'use strict';
const gateway = require('./paymentGatewayClient');
const { executeWithRetry } = require('./paymentRetryService');
const { AppError } = require('../../errors');

async function authorizePayment({ orderId, amount, currency = 'USD', cardToken }) {
  try {
    const { result, attempts } = await executeWithRetry(() =>
      gateway.authorize({ amount, currency, cardToken, idempotencyKey: orderId })
    );
    return { ...result, attempts };
  } catch (err) {
    if (err.code === 'CARD_DECLINED') throw new AppError(`Payment declined: ${err.message}`, 402, 'PAYMENT_DECLINED');
    if (['GATEWAY_TIMEOUT', 'GATEWAY_UNAVAILABLE'].includes(err.code)) throw new AppError('Payment gateway unavailable, please try again', 504, 'PAYMENT_TIMEOUT');
    throw err;
  }
}

async function refundPayment({ authorizationId, amount }) {
  return gateway.refund({ authorizationId, amount });
}

module.exports = { authorizePayment, refundPayment };
