'use strict';
const express = require('express');
const orderService = require('../services/orderService');
const notifications = require('../services/notificationService');
const { requireAuth } = require('../middleware/auth');

/** Public order representation (contract documented in api/openapi.yaml#/components/schemas/Order). */
function toOrderResponse(order) {
  return {
    id: order.id,
    status: order.status,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    promoCode: order.promoCode,
    createdAt: order.createdAt
  };
}

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => res.json(orderService.listOrders(req.user.id).map(toOrderResponse)));

router.get('/:id', (req, res, next) => {
  try {
    res.json(toOrderResponse(orderService.getOrder(req.params.id, req.user)));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/cancel', (req, res, next) => {
  try {
    const order = orderService.cancelOrder(req.params.id, req.user);
    notifications.sendOrderCancelled(req.user, order);
    res.json(toOrderResponse(order));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/return', (req, res, next) => {
  try {
    res.json(toOrderResponse(orderService.requestReturn(req.params.id, req.user, req.body.reason)));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.toOrderResponse = toOrderResponse;
