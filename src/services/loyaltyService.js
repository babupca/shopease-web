'use strict';
/** SHOP-112 Loyalty programme: 1 point per whole dollar spent; 100 points = $1 store credit. */
const store = require('../data/store');
const { config } = require('../config');
const { AppError } = require('../errors');

const TIERS = [
  { name: 'Gold', minPoints: 1000 },
  { name: 'Silver', minPoints: 250 },
  { name: 'Bronze', minPoints: 0 }
];

function account(userId) {
  store.state.loyalty = store.state.loyalty || {};
  if (!store.state.loyalty[userId]) store.state.loyalty[userId] = { points: 0, ledger: [] };
  return store.state.loyalty[userId];
}

function assertEnabled() {
  if (!config.featureFlags.loyaltyProgram) throw new AppError('Loyalty programme is not enabled', 404, 'FEATURE_DISABLED');
}

function tierFor(points) {
  return TIERS.find((t) => points >= t.minPoints).name;
}

function awardForOrder(userId, order) {
  if (!config.featureFlags.loyaltyProgram) return 0;
  const points = Math.floor(order.total);
  const acct = account(userId);
  acct.points += points;
  acct.ledger.push({ type: 'EARN', orderId: order.id, points, at: new Date().toISOString() });
  return points;
}

function getBalance(userId) {
  assertEnabled();
  const acct = account(userId);
  return { points: acct.points, tier: tierFor(acct.points), creditValue: acct.points / 100 };
}

function redeem(userId, points) {
  assertEnabled();
  if (!Number.isInteger(points) || points <= 0 || points % 100 !== 0) {
    throw new AppError('Points must be a positive multiple of 100', 400, 'INVALID_POINTS');
  }
  const acct = account(userId);
  if (points > acct.points) throw new AppError('Not enough points', 409, 'INSUFFICIENT_POINTS');
  acct.points -= points;
  acct.ledger.push({ type: 'REDEEM', points: -points, at: new Date().toISOString() });
  return { redeemed: points, credit: points / 100, balance: acct.points };
}

module.exports = { awardForOrder, getBalance, redeem, tierFor, TIERS };
