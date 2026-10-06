'use strict';
/**
 * Retries gateway operations that fail with a transient error.
 * SHOP-101: exponential back-off with full jitter, capped at maxBackoffMs,
 * and gateway 503 (GATEWAY_UNAVAILABLE) is now treated as retryable.
 */
const { config } = require('../../config');

const RETRYABLE_CODES = ['GATEWAY_TIMEOUT', 'GATEWAY_UNAVAILABLE'];

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(attempt, baseMs, maxMs, random = Math.random) {
  const exponential = Math.min(maxMs, baseMs * 2 ** (attempt - 1));
  return Math.round(exponential / 2 + random() * (exponential / 2));
}

async function executeWithRetry(operation, options = {}) {
  const {
    maxRetries = config.payment.retry.maxRetries,
    backoffMs = config.payment.retry.backoffMs,
    maxBackoffMs = config.payment.retry.maxBackoffMs || 1000,
    isRetryable = (err) => RETRYABLE_CODES.includes(err.code),
    sleep = defaultSleep,
    random = Math.random
  } = options;

  let attempt = 0;
  for (;;) {
    try {
      const result = await operation(attempt);
      return { result, attempts: attempt + 1 };
    } catch (err) {
      if (!isRetryable(err) || attempt >= maxRetries) {
        err.attempts = attempt + 1;
        throw err;
      }
      attempt += 1;
      if (backoffMs > 0) await sleep(backoffDelay(attempt, backoffMs, maxBackoffMs, random));
    }
  }
}

module.exports = { executeWithRetry, backoffDelay, RETRYABLE_CODES };
