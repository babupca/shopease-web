'use strict';
/** Shared money helpers used by cart, tax, promo, checkout and orders. */

function round2(value) {
  return Math.round(value * 100) / 100;
}

function sum(values) {
  return round2(values.reduce((acc, v) => acc + v, 0));
}

function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

module.exports = { round2, sum, formatCurrency };
