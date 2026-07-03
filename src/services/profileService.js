'use strict';
const store = require('../data/store');
const { AppError } = require('../errors');
const { publicUser } = require('./authService');
const { supportedRegions } = require('./taxService');

function findUser(userId) {
  const user = store.state.users.find((u) => u.id === userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  return user;
}

function getProfile(userId) {
  return publicUser(findUser(userId));
}

function updateProfile(userId, { name, region } = {}) {
  const user = findUser(userId);
  if (name !== undefined) {
    if (!String(name).trim()) throw new AppError('Name cannot be empty', 400, 'VALIDATION_ERROR');
    user.name = String(name).trim();
  }
  if (region !== undefined) {
    if (!supportedRegions().includes(region)) throw new AppError('Unsupported region', 400, 'UNSUPPORTED_REGION');
    user.region = region;
  }
  return publicUser(user);
}

function addAddress(userId, address = {}) {
  const user = findUser(userId);
  for (const field of ['line1', 'city', 'postcode']) {
    if (!address[field]) throw new AppError(`Address ${field} is required`, 400, 'VALIDATION_ERROR');
  }
  const entry = { id: `ADDR-${user.addresses.length + 1}`, ...address };
  user.addresses.push(entry);
  return entry;
}

module.exports = { getProfile, updateProfile, addAddress };
