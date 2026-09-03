'use strict';
const { applyPromo } = require('../../src/services/promoService');

describe('Promotions', () => {
  test('[UT-PROMO-001] no promo code gives no discount', () => {
    expect(applyPromo(undefined, 80)).toEqual({ code: null, discount: 0, freeShipping: false });
  });

  test('[UT-PROMO-002] WELCOME10 applies 10 percent', () => {
    expect(applyPromo('WELCOME10', 80).discount).toBe(8);
  });

  test('[UT-PROMO-003] promo codes are case-insensitive and trimmed', () => {
    expect(applyPromo('  welcome10 ', 50).code).toBe('WELCOME10');
  });

  test('[UT-PROMO-004] SAVE5 applies a fixed 5 discount', () => {
    expect(applyPromo('SAVE5', 30).discount).toBe(5);
  });

  test('[UT-PROMO-005] SAVE5 below the 25 minimum is rejected', () => {
    expect(() => applyPromo('SAVE5', 20)).toThrow(expect.objectContaining({ code: 'PROMO_MIN_NOT_MET' }));
  });

  test('[UT-PROMO-006] BIGSPEND20 applies 20 percent at the 300 threshold', () => {
    expect(applyPromo('BIGSPEND20', 300).discount).toBe(60);
  });

  test('[UT-PROMO-007] BIGSPEND20 below 300 is rejected', () => {
    expect(() => applyPromo('BIGSPEND20', 299.99)).toThrow(expect.objectContaining({ code: 'PROMO_MIN_NOT_MET' }));
  });

  test('[UT-PROMO-008] FREESHIP grants free shipping without a discount', () => {
    expect(applyPromo('FREESHIP', 10)).toEqual({ code: 'FREESHIP', discount: 0, freeShipping: true });
  });

  test('[UT-PROMO-009] unknown promo code is rejected', () => {
    expect(() => applyPromo('BOGUS', 10)).toThrow(expect.objectContaining({ code: 'INVALID_PROMO' }));
  });

  test('[UT-PROMO-010] percent discount is rounded to cents', () => {
    expect(applyPromo('WELCOME10', 33.33).discount).toBe(3.33);
  });

  test('[UT-PROMO-011] an expired promo code is rejected', () => {
    expect(() => applyPromo('SUMMER15', 40, new Date('2026-09-01T00:00:00Z'))).toThrow(expect.objectContaining({ code: 'PROMO_EXPIRED' }));
  });

  test('[UT-PROMO-012] a promo code is valid up to the end of its expiry date', () => {
    expect(applyPromo('SUMMER15', 40, new Date('2026-08-31T20:00:00Z')).discount).toBe(6);
  });

  test('[UT-PROMO-013] BIGSPEND20 expires after 2027', () => {
    expect(() => applyPromo('BIGSPEND20', 400, new Date('2028-01-01T00:00:00Z'))).toThrow(expect.objectContaining({ code: 'PROMO_EXPIRED' }));
  });
});
