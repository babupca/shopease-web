'use strict';
const { AppError } = require('../errors');
const { round2 } = require('../utils/money');

const PROMOTIONS = {
  WELCOME10: { type: 'percent', value: 10, minSubtotal: 0 },
  SAVE5: { type: 'fixed', value: 5, minSubtotal: 25 },
  BIGSPEND20: { type: 'percent', value: 20, minSubtotal: 300 },
  FREESHIP: { type: 'shipping', value: 0, minSubtotal: 0 }
};

function applyPromo(code, subtotal) {
  if (!code) return { code: null, discount: 0, freeShipping: false };
  const key = String(code).trim().toUpperCase();
  const promo = PROMOTIONS[key];
  if (!promo) throw new AppError('Invalid promo code', 400, 'INVALID_PROMO');
  if (subtotal < promo.minSubtotal) {
    throw new AppError(`Promo ${key} requires a minimum subtotal of ${promo.minSubtotal}`, 400, 'PROMO_MIN_NOT_MET');
  }
  if (promo.type === 'shipping') return { code: key, discount: 0, freeShipping: true };
  const raw = promo.type === 'percent' ? (subtotal * promo.value) / 100 : promo.value;
  return { code: key, discount: round2(Math.min(raw, subtotal)), freeShipping: false };
}

module.exports = { applyPromo, PROMOTIONS };
