'use strict';
const express = require('express');
const checkoutService = require('../services/checkoutService');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { toOrderResponse } = require('./orders');

const router = express.Router();
router.use(requireAuth);

router.post('/quote', asyncHandler(async (req, res) => {
  res.json(checkoutService.quote(req.user.id, req.body));
}));

router.post('/', asyncHandler(async (req, res) => {
  const order = await checkoutService.checkout(req.user.id, req.body);
  res.status(201).json(toOrderResponse(order));
}));

module.exports = router;
