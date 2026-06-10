'use strict';
const crypto = require('crypto');
const store = require('../data/store');
const { config } = require('../config');
const { AppError } = require('../errors');

function publicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

function login(email, password, now = Date.now()) {
  if (!email || !password) throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
  const s = store.state;
  const key = String(email).toLowerCase();
  if ((s.loginAttempts[key] || 0) >= config.auth.maxLoginAttempts) {
    throw new AppError('Account locked after too many failed attempts', 423, 'ACCOUNT_LOCKED');
  }
  const user = s.users.find((u) => u.email === key);
  if (!user || user.password !== password) {
    s.loginAttempts[key] = (s.loginAttempts[key] || 0) + 1;
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  s.loginAttempts[key] = 0;
  const token = `sess_${crypto.randomBytes(12).toString('hex')}`;
  const expiresAt = now + config.auth.tokenTtlMinutes * 60 * 1000;
  s.sessions[token] = { userId: user.id, expiresAt };
  return { token, expiresAt, user: publicUser(user) };
}

function verify(token, now = Date.now()) {
  const session = store.state.sessions[token];
  if (!session) throw new AppError('Invalid or missing token', 401, 'UNAUTHORIZED');
  if (session.expiresAt <= now) {
    delete store.state.sessions[token];
    throw new AppError('Session expired', 401, 'SESSION_EXPIRED');
  }
  return publicUser(store.state.users.find((u) => u.id === session.userId));
}

function logout(token) {
  delete store.state.sessions[token];
}

function register({ email, password, name } = {}) {
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new AppError('A valid email is required', 400, 'VALIDATION_ERROR');
  if (!password || password.length < config.auth.passwordMinLength) {
    throw new AppError(`Password must be at least ${config.auth.passwordMinLength} characters`, 400, 'WEAK_PASSWORD');
  }
  const key = email.toLowerCase();
  if (store.state.users.some((u) => u.email === key)) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  const user = {
    id: `U-${store.state.users.length + 100}`,
    email: key,
    password,
    name: name || key.split('@')[0],
    role: 'customer',
    region: config.tax.defaultRegion,
    savedCardToken: null,
    addresses: []
  };
  store.state.users.push(user);
  return publicUser(user);
}

module.exports = { login, verify, logout, register, publicUser };
