'use strict';
const express = require('express');
const loyalty = require('../services/loyaltyService');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/balance', (req, res, next) => {
  try {
    res.json(loyalty.getBalance(req.user.id));
  } catch (err) {
    next(err);
  }
});

router.post('/redeem', (req, res, next) => {
  try {
    res.json(loyalty.redeem(req.user.id, req.body.points));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
