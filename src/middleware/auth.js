'use strict';
const authService = require('../services/authService');
const { AppError } = require('../errors');

function bearerToken(req) {
  const header = req.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function requireAuth(req, res, next) {
  try {
    req.token = bearerToken(req);
    req.user = authService.verify(req.token);
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    return next();
  };
}

module.exports = { requireAuth, requireRole, bearerToken };
