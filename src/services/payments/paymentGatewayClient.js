'use strict';
/**
 * Simulated client for the external PayGate payment gateway.
 * Card tokens drive behaviour so tests can exercise every path:
 *   tok_success | tok_decline | tok_insufficient | tok_timeout | tok_timeout_once | tok_unavailable_once
 */
const { config } = require('../../config');
const { AppError } = require('../../errors');

class GatewayError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

let callCounts = {};

function resetGateway() {
  callCounts = {};
}

function callCount(idempotencyKey) {
  return callCounts[idempotencyKey] || 0;
}

async function authorize({ amount, currency = 'USD', cardToken, idempotencyKey }) {
  if (!cardToken) throw new AppError('Card token is required', 400, 'CARD_TOKEN_REQUIRED');
  if (typeof amount !== 'number' || amount <= 0) throw new AppError('Amount must be positive', 400, 'INVALID_AMOUNT');
  callCounts[idempotencyKey] = callCount(idempotencyKey) + 1;

  switch (cardToken) {
    case 'tok_decline':
      throw new GatewayError('Card declined', 'CARD_DECLINED');
    case 'tok_insufficient':
      throw new GatewayError('Insufficient funds', 'CARD_DECLINED');
    case 'tok_timeout':
      throw new GatewayError(`Gateway did not respond within ${config.payment.timeoutMs}ms`, 'GATEWAY_TIMEOUT');
    case 'tok_unavailable_once':
      if (callCounts[idempotencyKey] === 1) throw new GatewayError('Gateway returned 503 Service Unavailable', 'GATEWAY_UNAVAILABLE');
      break;
    case 'tok_timeout_once':
      if (callCounts[idempotencyKey] === 1) {
        throw new GatewayError(`Gateway did not respond within ${config.payment.timeoutMs}ms`, 'GATEWAY_TIMEOUT');
      }
      break;
    default:
      break;
  }
  return {
    authorizationId: `AUTH-${idempotencyKey}-${callCounts[idempotencyKey]}`,
    status: 'AUTHORIZED',
    amount,
    currency,
    gateway: config.payment.gatewayUrl
  };
}

async function refund({ authorizationId, amount }) {
  if (!authorizationId) throw new AppError('authorizationId is required', 400, 'VALIDATION_ERROR');
  return { refundId: `RF-${authorizationId}`, status: 'REFUNDED', amount };
}

module.exports = { authorize, refund, resetGateway, callCount, GatewayError };
