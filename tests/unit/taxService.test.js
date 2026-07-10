'use strict';
const tax = require('../../src/services/taxService');

describe('Tax calculation', () => {
  test.each([
    { id: 'UT-TAX-001', region: 'US-CA', amount: 100, expected: 7.25 },
    { id: 'UT-TAX-002', region: 'US-NY', amount: 100, expected: 4 },
    { id: 'UT-TAX-003', region: 'US-TX', amount: 100, expected: 6.25 },
    { id: 'UT-TAX-004', region: 'US-WA', amount: 100, expected: 6.5 },
    { id: 'UT-TAX-005', region: 'US-OR', amount: 100, expected: 0 },
    { id: 'UT-TAX-006', region: 'US-CA', amount: 59.99, expected: 4.35 }
  ])('[$id] calculates tax for $region on $amount', ({ region, amount, expected }) => {
    expect(tax.calculateTax(amount, region)).toBe(expected);
  });

  test('[UT-TAX-007] uses the default region (US-CA) when none is given', () => {
    expect(tax.calculateTax(200)).toBe(14.5);
  });

  test('[UT-TAX-008] rejects an unsupported region', () => {
    expect(() => tax.calculateTax(10, 'US-ZZ')).toThrow(expect.objectContaining({ code: 'UNSUPPORTED_REGION' }));
  });

  test('[UT-TAX-009] rejects a negative taxable amount', () => {
    expect(() => tax.calculateTax(-1, 'US-CA')).toThrow(expect.objectContaining({ code: 'INVALID_AMOUNT' }));
  });

  test('[UT-TAX-010] returns zero tax for a zero amount', () => {
    expect(tax.calculateTax(0, 'US-NY')).toBe(0);
  });

  test('[UT-TAX-011] lists all supported regions', () => {
    expect(tax.supportedRegions().sort()).toEqual(['US-CA', 'US-NY', 'US-OR', 'US-TX', 'US-WA']);
  });
});
