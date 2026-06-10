'use strict';
const express = require('express');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res, next) => {
  try {
    res.json(authService.login(req.body.email, req.body.password));
  } catch (err) {
    next(err);
  }
});

router.post('/register', (req, res, next) => {
  try {
    res.status(201).json(authService.register(req.body));
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, (req, res) => {
  authService.logout(req.token);
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => res.json(req.user));

module.exports = router;
