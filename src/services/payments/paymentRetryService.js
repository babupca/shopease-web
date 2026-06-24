'use strict';
/**
 * Retries gateway operations that fail with a transient timeout.
 * Retry count and back-off come from config.payment.retry.
 */
const { config } = require('../../config');

const RETRYABLE_CODES = ['GATEWAY_TIMEOUT'];

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry(operation, options = {}) {
  const {
    maxRetries = config.payment.retry.maxRetries,
    backoffMs = config.payment.retry.backoffMs,
    isRetryable = (err) => RETRYABLE_CODES.includes(err.code),
    sleep = defaultSleep
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
      if (backoffMs > 0) await sleep(backoffMs);
    }
  }
}

module.exports = { executeWithRetry, RETRYABLE_CODES };
