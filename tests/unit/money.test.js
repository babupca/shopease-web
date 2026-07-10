'use strict';
const { round2, sum, formatCurrency } = require('../../src/utils/money');

describe('Money utilities', () => {
  test.each([
    { id: 'UT-MONEY-001', input: 10.126, expected: 10.13 },
    { id: 'UT-MONEY-002', input: 10.124, expected: 10.12 },
    { id: 'UT-MONEY-003', input: 0, expected: 0 },
    { id: 'UT-MONEY-004', input: 99.999, expected: 100 }
  ])('[$id] round2($input) returns $expected', ({ input, expected }) => {
    expect(round2(input)).toBe(expected);
  });

  test('[UT-MONEY-005] sum avoids floating point drift', () => {
    expect(sum([0.1, 0.2])).toBe(0.3);
  });

  test('[UT-MONEY-006] formatCurrency formats USD with grouping', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });
});
