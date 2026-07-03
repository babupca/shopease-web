'use strict';
const express = require('express');
const orderService = require('../services/orderService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { toOrderResponse } = require('./orders');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

router.get('/orders', (req, res) => res.json(orderService.listAllOrders(req.query).map(toOrderResponse)));

router.patch('/orders/:id/status', (req, res, next) => {
  try {
    res.json(toOrderResponse(orderService.updateStatus(req.params.id, req.body.status)));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
