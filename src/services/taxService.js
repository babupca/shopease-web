'use strict';
const { config } = require('../config');
const { AppError } = require('../errors');
const { round2 } = require('../utils/money');

function getRate(region) {
  const rate = config.tax.rates[region];
  if (rate === undefined) throw new AppError(`Unsupported tax region: ${region}`, 400, 'UNSUPPORTED_REGION');
  return rate;
}

function calculateTax(amount, region = config.tax.defaultRegion) {
  if (typeof amount !== 'number' || amount < 0) throw new AppError('Taxable amount must be >= 0', 400, 'INVALID_AMOUNT');
  return round2(amount * getRate(region));
}

function supportedRegions() {
  return Object.keys(config.tax.rates);
}

module.exports = { calculateTax, getRate, supportedRegions };
